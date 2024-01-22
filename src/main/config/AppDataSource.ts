import { DataSource } from 'typeorm';
import log from 'electron-log';
import {
  AccountEntity,
  AssetGroupEntity,
  BalanceEntity,
  CategoryEntity,
  CodeItemEntity,
  CodeMainEntity,
  ExchangeEntity,
  ExchangeRateEntity,
  FavoriteEntity,
  MemoEntity,
  SnapshotEntity,
  StockBuyEntity,
  StockEntity,
  StockEvaluateEntity,
  TradeEntity,
  TransactionEntity,
  UserEntity,
} from '../entity/Entity';
import Constant from '../../common/Constant';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: Constant.DB_PATH,
  entities: [
    UserEntity,
    AccountEntity,
    BalanceEntity,
    CategoryEntity,
    FavoriteEntity,
    MemoEntity,
    TransactionEntity,
    StockEntity,
    StockBuyEntity,
    TradeEntity,
    ExchangeEntity,
    SnapshotEntity,
    ExchangeRateEntity,
    AssetGroupEntity,
    StockEvaluateEntity,
    CodeMainEntity,
    CodeItemEntity,
  ],
  synchronize: true,
  // SQLite 데이터베이스 파일에 로그를 남길지 여부
  logging: true,
  logger: 'advanced-console',
});

export async function initConnection() {
  if (AppDataSource.isInitialized) {
    return;
  }
  await AppDataSource.initialize()
    // eslint-disable-next-line promise/always-return
    .then(() => {
      log.info('DB 연결 성공');
    })
    .catch((error) => {
      log.error(`DB 연결 실패${error}`);
    });
}
export async function closeConnection() {
  if (!AppDataSource.isInitialized) {
    return;
  }
  try {
    await AppDataSource.destroy();
    log.info('DB 연결 종료 성공');
  } catch (error) {
    log.error(`DB 연결 종료 실패: ${error}`);
  }
}

export default AppDataSource;
