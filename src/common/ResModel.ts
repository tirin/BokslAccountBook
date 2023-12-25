// renderer process가 main process에게 받는 데이터의 형식을 정의

import { Currency, CurrencyAmountModel, ExchangeKind, TradeKind, TransactionKind } from './CommonType';

export type ResFavoriteModel = {
  favoriteSeq: number;
  title: string;
  categorySeq: number;
  kind: TransactionKind;
  note: string;
  currency: Currency;
  amount: number;
  payAccount: number;
  receiveAccount: number;
  attribute: number;
  orderNo: number;
};

// API 응답값
export type ResTradeModel = {
  id: number;
  type: TradeKind;
  note: string;
  item: string;
  quantity: number;
  price: number;
  total: number;
  profitLossAmount?: number | null; // 손익금
  returnRate?: number | null; // 수익률
  tax: number;
  fee: number;
  accountSeq: number;
  date: Date;
};

export type ResTransactionModel = {
  id: number;
  type: TransactionKind;
  note: string;
  categoryMain: string;
  categorySub: string;
  currency: Currency;
  price: number;
  fee: number;
  payAccountSeq: number | null;
  receiveAccountSeq: number | null;
  date: Date; // date 타입으로 변경
};

export type ResExchangeModel = {
  id: number;
  type: ExchangeKind;
  note: string;
  sellCurrency: Currency;
  sellPrice: number;
  buyCurrency: Currency;
  buyPrice: number;
  fee: number;
  accountSeq: number;
  date: Date;
};

export type ResAccountModel = {
  accountSeq: number;
  assetType: number;
  accountType: number;
  name: string;
  balance: CurrencyAmountModel[];
  stockBuyPrice: CurrencyAmountModel[];
  interestRate: string;
  accountNumber: string;
  monthlyPay: string;
  expDate: string;
  note: string;
  enable: boolean;
};

// 주식 종목 API 응답값
export type ResStockModel = {
  stockSeq: number; // 일련번호
  name: string; // 종목명
  currency: Currency; // 매매 통화
  stockTypeCode: number; // 종목유형
  nationCode: number; // 상장국가
  link: string; // 상세정보 링크
  note?: string; // 메모
  enableF: boolean; // 사용여부
};

// 매수 주식 목록 API 응답값
export type ResStockBuyModel = {
  stockBuySeq: number; // 일련번호
  stockSeq: number; // 주식 종목 일련번호
  accountSeq: number; // 계좌 일련번호
  buyAmount: number; // 매수금액
  quantity: number; // 수량
};

// 자산 스냅샷 API 응답값
export type ResAssetSnapshotModel = {
  assetSnapshotSeq: number; // 일련번호
  name: string; // 설명
  totalAmount: number; // 합산자산
  evaluateAmount: number; // 평가금액
  stockSellCheckDate: Date; // 메도 체크 시작일
  stockSellProfitLossAmount: number; // 매도 차익
  regDate: Date; // 등록일
};
export type ResCategoryModel = {
  categorySeq: number;
  kind: TransactionKind;
  name: string;
  parentSeq: number;
  orderNo: number;
};

export type ResErrorModel = {
  message: string;
};
