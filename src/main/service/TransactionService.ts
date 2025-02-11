import moment from 'moment';
import { Brackets, EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ReqMonthlyAmountSumModel, ReqMonthlySummaryModel, ReqSearchModel, ReqTransactionModel } from '../../common/ReqModel';
import TransactionRepository from '../repository/TransactionRepository';
import { CategoryEntity, TransactionEntity } from '../entity/Entity';
import { ResTransactionModel, ResTransactionSum, ResTransactionSummary } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import AccountService from './AccountService';
import { TransactionKind } from '../../common/CommonType';

export default class TransactionService {
  private static transactionRepository = new TransactionRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(transaction: TransactionEntity) {
    return {
      transactionSeq: transaction.transactionSeq,
      categorySeq: transaction.categorySeq,
      kind: transaction.kind,
      payAccount: transaction.payAccount,
      receiveAccount: transaction.receiveAccount,
      attribute: transaction.attribute,
      currency: transaction.currency,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      fee: transaction.fee,
    } as ResTransactionModel;
  }

  static async get(transactionSeq: number) {
    const transaction = await this.transactionRepository.repository.findOne({ where: { transactionSeq } });
    if (!transaction) {
      throw new Error('거래 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(transaction);
  }

  static async findList(searchCondition: ReqSearchModel) {
    const transactionEntitySelectQueryBuilder = this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD'),
        to: moment(searchCondition.to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.currency) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.currency = :currency', { currency: searchCondition.currency });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      transactionEntitySelectQueryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('transaction.payAccount = :accountSeq', { accountSeq: searchCondition.accountSeq }).orWhere(
            'transaction.receiveAccount = :accountSeq',
            { accountSeq: searchCondition.accountSeq },
          );
        }),
      );
    }
    transactionEntitySelectQueryBuilder.orderBy('transaction.transactionDate', 'DESC').addOrderBy('transaction.transactionSeq', 'DESC');
    const transactionList = await transactionEntitySelectQueryBuilder.getMany();
    const result = transactionList.map(async (transaction) => {
      return this.mapEntityToRes(transaction);
    });
    return Promise.all(result);
  }

  static async getMonthlySummary({ from, to, kind, currency }: ReqMonthlySummaryModel) {
    const rawResult = await this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select([
        "strftime('%Y-%m-01', transaction.transactionDate) AS transactionDate",
        'category.parentSeq AS parentSeq',
        'SUM(transaction.amount) AS amount',
      ])
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind = :kind', { kind })
      .andWhere('transaction.currency = :currency', { currency })
      .leftJoin(CategoryEntity, 'category', 'transaction.categorySeq = category.categorySeq')
      .groupBy("strftime('%Y-%m-01', transaction.transactionDate) ")
      .addGroupBy('category.parentSeq')
      .orderBy("strftime('%Y-%m-01', transaction.transactionDate)", 'ASC')
      .getRawMany();

    return rawResult.map((result) => ({
      transactionDate: new Date(result.transactionDate),
      parentSeq: result.parentSeq,
      amount: result.amount,
    })) as ResTransactionSummary[];
  }

  static async getMonthlyAmountSum({ from, to, currency }: ReqMonthlyAmountSumModel) {
    const rawResult = await this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select([
        "strftime('%Y-%m-01', transaction.transactionDate) AS transactionDate",
        'transaction.kind as kind',
        'SUM(transaction.amount) AS amount',
        'SUM(transaction.fee) AS fee',
      ])
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.currency = :currency', { currency })
      .groupBy("strftime('%Y-%m-01', transaction.transactionDate) ")
      .addGroupBy('transaction.kind')
      .orderBy("strftime('%Y-%m-01', transaction.transactionDate)", 'ASC')
      .getRawMany();

    return rawResult.map((result) => ({
      transactionDate: new Date(result.transactionDate),
      kind: result.kind,
      amount: result.amount,
      fee: result.fee,
    })) as ResTransactionSum[];
  }

  static async findCategoryByNote(kind: TransactionKind, note: string) {
    const from = new Date();
    // 100일 전 데이터에 대해서만 조회
    from.setDate(from.getDate() - 100);

    const transactionEntitySelectQueryBuilder = this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select(['transaction.categorySeq as categorySeq'])
      .where('transaction.transactionDate > :from ', {
        from: moment(from).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind = :kind', { kind });
    if (note) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.note LIKE :note', { note: `${escapeWildcards(note)}%` });
    }
    transactionEntitySelectQueryBuilder.groupBy('transaction.categorySeq');
    const categorySeqList = await transactionEntitySelectQueryBuilder.getRawMany();
    const result = categorySeqList.map((result) => {
      return result.categorySeq;
    });

    return Promise.all(result);
  }

  static async save(transactionForm: ReqTransactionModel) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const entity = transactionalEntityManager.create(TransactionEntity, {
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      });

      await transactionalEntityManager.save(TransactionEntity, entity);

      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(transactionalEntityManager, transactionForm);
    });
  }

  static async update(transactionForm: ReqTransactionModel) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.transactionRepository.repository.findOne({ where: { transactionSeq: transactionForm.transactionSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      // 계좌 잔고 동기화(이전 상태로 복구)
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);

      const updateData = {
        ...beforeData,
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      };

      await transactionalEntityManager.save(TransactionEntity, updateData);
      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(transactionalEntityManager, transactionForm);
    });
  }

  static async delete(transactionSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.transactionRepository.repository.findOne({ where: { transactionSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(TransactionEntity, { transactionSeq });
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);
    });
  }

  private static async updateBalanceForInsert(transactionalEntityManager: EntityManager, transactionForm: ReqTransactionModel) {
    switch (transactionForm.kind) {
      case TransactionKind.SPENDING:
        await AccountService.updateBalance(
          transactionalEntityManager,
          transactionForm.payAccount,
          transactionForm.currency,
          -(transactionForm.amount + transactionForm.fee),
        );
        break;
      case TransactionKind.INCOME:
        await AccountService.updateBalance(
          transactionalEntityManager,
          transactionForm.receiveAccount,
          transactionForm.currency,
          transactionForm.amount - transactionForm.fee,
        );
        break;
      case TransactionKind.TRANSFER:
        await AccountService.updateBalance(
          transactionalEntityManager,
          transactionForm.payAccount,
          transactionForm.currency,
          -transactionForm.amount - transactionForm.fee,
        );
        await AccountService.updateBalance(
          transactionalEntityManager,
          transactionForm.receiveAccount,
          transactionForm.currency,
          transactionForm.amount,
        );
        break;
      default:
        throw new Error('거래 유형을 찾을 수 없습니다.');
    }
  }

  private static async updateBalanceForDelete(transactionalEntityManager: EntityManager, beforeData: TransactionEntity) {
    // 계좌 잔고 업데이트
    switch (beforeData.kind) {
      case TransactionKind.SPENDING:
        await AccountService.updateBalance(
          transactionalEntityManager,
          beforeData.payAccount!,
          beforeData.currency,
          beforeData.amount + beforeData.fee,
        );
        break;
      case TransactionKind.INCOME:
        await AccountService.updateBalance(
          transactionalEntityManager,
          beforeData.receiveAccount!,
          beforeData.currency,
          -(beforeData.amount - beforeData.fee),
        );
        break;
      case TransactionKind.TRANSFER:
        await AccountService.updateBalance(
          transactionalEntityManager,
          beforeData.payAccount!,
          beforeData.currency,
          beforeData.amount + beforeData.fee,
        );
        await AccountService.updateBalance(transactionalEntityManager, beforeData.receiveAccount!, beforeData.currency, -beforeData.amount);
        break;
      default:
        throw new Error('거래 유형을 찾을 수 없습니다.');
    }
  }
}
