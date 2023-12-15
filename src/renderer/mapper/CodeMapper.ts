import _ from 'lodash';

/**
 * 코드 매핑을 위한 유틸리티
 */

export type CodeValueModel = {
  codeSeq: number;
  name: string;
};

export type CodeMapping = {
  code: string;
  name: string;
  subCodeList: CodeValueModel[];
};

let globalCodeMapping: CodeMapping[];

export function loadCodeMapping() {
  globalCodeMapping = [
    {
      code: 'KIND_CODE',
      name: '자산유형',
      subCodeList: [
        {
          codeSeq: 1,
          name: '신용카드',
        },
        {
          codeSeq: 2,
          name: '체크카드',
        },
        {
          codeSeq: 3,
          name: '은행통장',
        },
      ],
    },
    {
      code: 'ATTR_SPENDING',
      name: '지출속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 지출',
        },
        {
          codeSeq: 2,
          name: '고정 지출',
        },
      ],
    },
    {
      code: 'ATTR_TRANSFER',
      name: '이체속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 이체',
        },
        {
          codeSeq: 2,
          name: '투자 이체',
        },
        {
          codeSeq: 3,
          name: '부채 이체',
        },
      ],
    },
    {
      code: 'ATTR_INCOME',
      name: '수입속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 수입',
        },
        {
          codeSeq: 2,
          name: '투자 수입',
        },
      ],
    },
    {
      code: 'TYPE_STOCK',
      name: '주식종류',
      subCodeList: [
        {
          codeSeq: 1,
          name: '개별종목',
        },
        {
          codeSeq: 2,
          name: '지수 ETF',
        },
        {
          codeSeq: 3,
          name: '리츠 ETF',
        },
      ],
    },
    {
      code: 'TYPE_ACCOUNT',
      name: '계좌성격',
      subCodeList: [
        {
          codeSeq: 1,
          name: '고정자산',
        },
        {
          codeSeq: 2,
          name: '저축자산',
        },
        {
          codeSeq: 3,
          name: '투자자산',
        },
      ],
    },
    {
      code: 'TYPE_NATION',
      name: '주식 상장국가',
      subCodeList: [
        {
          codeSeq: 1,
          name: '국내',
        },
        {
          codeSeq: 2,
          name: '국내상장 외국 ETF',
        },
        {
          codeSeq: 3,
          name: '미국',
        },
      ],
    },
  ];
}

export function getCodeValue(mainCode: string, subCode: number): string | undefined {
  const code = globalCodeMapping.find((code) => code.code === mainCode);
  if (!code) return undefined;
  return code.subCodeList.find((code) => code.codeSeq === subCode)?.name;
}

export function getSubCodeList(mainCode: string): CodeValueModel[] {
  const code = globalCodeMapping.find((code) => code.code === mainCode);
  if (!code) {
    return [];
  }
  return _.cloneDeep(code.subCodeList);
}

export function getCodeList() {
  return _.cloneDeep(globalCodeMapping);
}