import { JournalEntry, JournalDetail, ChartOfAccount } from '../types';
import { StorageService } from './storage';

export class AccountingEngine {
  /**
   * Validates if journal details are balanced (Debit === Credit)
   */
  public static validateBalance(details: JournalDetail[]): { isBalanced: boolean; totalDebit: number; totalCredit: number } {
    const totalDebit = details.reduce((sum, d) => sum + (Number(d.debit) || 0), 0);
    const totalCredit = details.reduce((sum, d) => sum + (Number(d.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    return { isBalanced, totalDebit, totalCredit };
  }

  /**
   * Alias helper to create manual or programmatic journal entries
   */
  public static createJournalEntry(entry: {
    journalType?: string;
    sourceModule: JournalEntry['sourceModule'];
    sourceId: string;
    description: string;
    lines: Array<{ coaCode: string; accountName: string; debit: number; credit: number; notes?: string }>;
    userId: string;
    userName: string;
  }): JournalEntry {
    const details: JournalDetail[] = entry.lines.map((l, idx) => ({
      itemId: `JRD-${Date.now()}-${idx}`,
      coaCode: l.coaCode,
      accountName: l.accountName,
      debit: l.debit,
      credit: l.credit,
      memo: l.notes || '',
    }));

    return this.postJournal({
      sourceModule: entry.sourceModule,
      sourceId: entry.sourceId,
      eventId: `EVT-${Date.now()}`,
      referenceNumber: entry.sourceId,
      description: entry.description,
      details,
      userId: entry.userId,
      userName: entry.userName,
    });
  }

  /**
   * Posts a validated double-entry journal to KSP_AKUNTANSI
   */
  public static postJournal(entry: {
    sourceModule: JournalEntry['sourceModule'];
    sourceId: string;
    eventId: string;
    referenceNumber: string;
    description: string;
    details: JournalDetail[];
    userId: string;
    userName: string;
  }): JournalEntry {
    const { isBalanced, totalDebit, totalCredit } = this.validateBalance(entry.details);
    if (!isBalanced) {
      throw new Error(`Jurnal Tidak Seimbang! Total Debit (Rp ${totalDebit.toLocaleString('id-ID')}) tidak sama dengan Total Kredit (Rp ${totalCredit.toLocaleString('id-ID')}).`);
    }

    const journals = StorageService.getJournals();
    const coaList = StorageService.getCOA();
    const year = new Date().getFullYear();
    const nextSeq = String(journals.length + 1).padStart(6, '0');
    const journalId = `JR-${year}-${nextSeq}`;

    const newJournal: JournalEntry = {
      journalId,
      entryDate: new Date().toISOString().split('T')[0],
      referenceNumber: entry.referenceNumber,
      sourceModule: entry.sourceModule,
      sourceId: entry.sourceId,
      eventId: entry.eventId,
      description: entry.description,
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: 'POSTED',
      details: entry.details,
      createdById: entry.userId,
      createdByName: entry.userName,
      createdAt: new Date().toISOString(),
    };

    // Update COA Balances
    const updatedCoaList = coaList.map((account) => {
      const line = entry.details.find((d) => d.coaCode === account.coaCode);
      if (!line) return account;

      let newBalance = account.currentBalance;
      if (account.normalBalance === 'DEBIT') {
        newBalance = newBalance + line.debit - line.credit;
      } else {
        newBalance = newBalance + line.credit - line.debit;
      }
      return { ...account, currentBalance: newBalance };
    });

    journals.unshift(newJournal);
    StorageService.saveJournals(journals);
    StorageService.saveCOA(updatedCoaList);

    StorageService.addAuditLog({
      userId: entry.userId,
      userName: entry.userName,
      role: 'AKUNTING',
      module: 'AKUNTANSI',
      action: 'POST',
      recordId: journalId,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      message: `Posting Jurnal Otomatis ${journalId} (${entry.description}) Debit: ${totalDebit}, Kredit: ${totalCredit}`,
    });

    return newJournal;
  }

  /**
   * Automatic Journal Helper for Loan Disbursement
   */
  public static postLoanDisbursement(params: {
    loanId: string;
    contractNumber: string;
    partyName: string;
    principalAmount: number;
    adminFee: number;
    disbursedAmount: number;
    paymentMethod: 'KAS' | 'BANK';
    userId: string;
    userName: string;
  }): JournalEntry {
    const cashOrBankCoa = params.paymentMethod === 'KAS' ? '1-1001' : '1-1002'; // Kasir or Bank BCA
    const coaList = StorageService.getCOA();

    const piutangCoa = coaList.find((c) => c.coaCode === '1-1201')!;
    const cashCoa = coaList.find((c) => c.coaCode === cashOrBankCoa)!;
    const adminCoa = coaList.find((c) => c.coaCode === '4-1002')!;

    const details: JournalDetail[] = [
      {
        itemId: 'ITEM-01',
        coaCode: piutangCoa.coaCode,
        accountName: piutangCoa.accountName,
        debit: params.principalAmount,
        credit: 0,
        memo: `Piutang Pinjaman an ${params.partyName}`,
      },
      {
        itemId: 'ITEM-02',
        coaCode: cashCoa.coaCode,
        accountName: cashCoa.accountName,
        debit: 0,
        credit: params.disbursedAmount,
        memo: `Pencairan dana pinjaman ${params.contractNumber}`,
      },
    ];

    if (params.adminFee > 0) {
      details.push({
        itemId: 'ITEM-03',
        coaCode: adminCoa.coaCode,
        accountName: adminCoa.accountName,
        debit: 0,
        credit: params.adminFee,
        memo: `Pendapatan provisi/administrasi pinjaman ${params.contractNumber}`,
      });
    }

    return this.postJournal({
      sourceModule: 'PINJAMAN',
      sourceId: params.loanId,
      eventId: `EVT-${Date.now()}`,
      referenceNumber: params.contractNumber,
      description: `Pencairan Pinjaman ${params.contractNumber} (${params.partyName})`,
      details,
      userId: params.userId,
      userName: params.userName,
    });
  }

  /**
   * Automatic Journal Helper for Installment Receipt
   */
  public static postInstallmentPayment(params: {
    paymentId: string;
    contractNumber: string;
    partyName: string;
    installmentNo: number;
    principalPortion: number;
    interestPortion: number;
    penaltyPortion: number;
    totalAmount: number;
    paymentMethod: 'KAS' | 'BANK';
    userId: string;
    userName: string;
  }): JournalEntry {
    const cashOrBankCoa = params.paymentMethod === 'KAS' ? '1-1001' : '1-1002';
    const coaList = StorageService.getCOA();

    const cashCoa = coaList.find((c) => c.coaCode === cashOrBankCoa)!;
    const piutangCoa = coaList.find((c) => c.coaCode === '1-1201')!;
    const bungaCoa = coaList.find((c) => c.coaCode === '4-1001')!;
    const dendaCoa = coaList.find((c) => c.coaCode === '4-1003')!;

    const details: JournalDetail[] = [
      {
        itemId: 'ITEM-01',
        coaCode: cashCoa.coaCode,
        accountName: cashCoa.accountName,
        debit: params.totalAmount,
        credit: 0,
        memo: `Penerimaan angsuran cicilan ke-${params.installmentNo} ${params.partyName}`,
      },
      {
        itemId: 'ITEM-02',
        coaCode: piutangCoa.coaCode,
        accountName: piutangCoa.accountName,
        debit: 0,
        credit: params.principalPortion,
        memo: `Pelunasan pokok angsuran ke-${params.installmentNo}`,
      },
    ];

    if (params.interestPortion > 0) {
      details.push({
        itemId: 'ITEM-03',
        coaCode: bungaCoa.coaCode,
        accountName: bungaCoa.accountName,
        debit: 0,
        credit: params.interestPortion,
        memo: `Pendapatan bunga angsuran ke-${params.installmentNo}`,
      });
    }

    if (params.penaltyPortion > 0) {
      details.push({
        itemId: 'ITEM-04',
        coaCode: dendaCoa.coaCode,
        accountName: dendaCoa.accountName,
        debit: 0,
        credit: params.penaltyPortion,
        memo: `Pendapatan denda keterlambatan angsuran ke-${params.installmentNo}`,
      });
    }

    return this.postJournal({
      sourceModule: 'ANGSURAN',
      sourceId: params.paymentId,
      eventId: `EVT-${Date.now()}`,
      referenceNumber: params.paymentId,
      description: `Pembayaran Angsuran ke-${params.installmentNo} ${params.contractNumber} (${params.partyName})`,
      details,
      userId: params.userId,
      userName: params.userName,
    });
  }

  /**
   * Automatic Journal for Savings Deposit
   */
  public static postSavingsDeposit(params: {
    transactionId: string;
    partyName: string;
    productCode: string;
    amount: number;
    paymentMethod: 'KAS' | 'BANK';
    userId: string;
    userName: string;
  }): JournalEntry {
    const cashOrBankCoa = params.paymentMethod === 'KAS' ? '1-1001' : '1-1002';
    const coaList = StorageService.getCOA();
    const cashCoa = coaList.find((c) => c.coaCode === cashOrBankCoa)!;

    let targetSavingsCoaCode = '2-1001'; // default sukarela
    if (params.productCode === 'POKOK') targetSavingsCoaCode = '3-1001';
    else if (params.productCode === 'WAJIB') targetSavingsCoaCode = '3-1002';
    else if (params.productCode === 'BERJANGKA') targetSavingsCoaCode = '2-1002';

    const savingsCoa = coaList.find((c) => c.coaCode === targetSavingsCoaCode)!;

    const details: JournalDetail[] = [
      {
        itemId: 'ITEM-01',
        coaCode: cashCoa.coaCode,
        accountName: cashCoa.accountName,
        debit: params.amount,
        credit: 0,
        memo: `Penerimaan setoran simpanan ${params.productCode} an ${params.partyName}`,
      },
      {
        itemId: 'ITEM-02',
        coaCode: savingsCoa.coaCode,
        accountName: savingsCoa.accountName,
        debit: 0,
        credit: params.amount,
        memo: `Penambahan saldo simpanan ${params.productCode} an ${params.partyName}`,
      },
    ];

    return this.postJournal({
      sourceModule: 'SIMPANAN',
      sourceId: params.transactionId,
      eventId: `EVT-${Date.now()}`,
      referenceNumber: params.transactionId,
      description: `Setoran Simpanan ${params.productCode} an ${params.partyName}`,
      details,
      userId: params.userId,
      userName: params.userName,
    });
  }
}
