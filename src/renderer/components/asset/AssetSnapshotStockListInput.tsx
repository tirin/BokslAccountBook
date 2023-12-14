import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { NumericFormat } from 'react-number-format';
import { StockEvaluateModel } from '../../common/BokslTypes';
import { convertToComma, renderSortIndicator } from '../util/util';
import { getStockBuy } from '../../mapper/StockBuyMapper';
import { getStock } from '../../mapper/StockMapper';
import { getAccount } from '../../mapper/AccountMapper';
import { getCodeValue } from '../../mapper/CodeMapper';

type AssetSnapshotStockListInputProps = {
  stockEvaluateList: StockEvaluateModel[];
  updateValue: (index: number, value: StockEvaluateModel) => void;
};

function AssetSnapshotStockListInput({ stockEvaluateList, updateValue }: AssetSnapshotStockListInputProps) {
  function renderEvaluateAmountInput(index: number, evaluateAmount: number) {
    return (
      <NumericFormat
        value={evaluateAmount}
        thousandSeparator
        maxLength={12}
        className="form-control"
        style={{ textAlign: 'right' }}
        onValueChange={(values) => {
          const newEvaluateAmount = values.floatValue ?? 0;
          updateValue(index, { ...stockEvaluateList[index], evaluateAmount: newEvaluateAmount });
        }}
      />
    );
  }

  // 종목, 연결계좌, 종류, 상장국가, 매수금액, 평가금액, 매도차익, 수익률
  const columns: Column<StockEvaluateModel>[] = React.useMemo(
    () => [
      {
        Header: '종목',
        id: 'stockName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => getStock(getStockBuy(value).stockSeq).name,
      },
      {
        Header: '연결계좌',
        id: 'accountName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => getAccount(getStockBuy(value).accountSeq).name,
      },
      {
        Header: '주식종류',
        id: 'typeStockName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => getCodeValue('TYPE_STOCK', getStock(getStockBuy(value).stockSeq).stockTypeCode),
      },
      {
        Header: '상장국가',
        id: 'typeNationName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => getCodeValue('TYPE_NATION', getStock(getStockBuy(value).stockSeq).nationCode),
      },
      {
        Header: '통화',
        id: 'currency',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => getStock(getStockBuy(value).stockSeq).currency,
      },
      { Header: '매수금액', accessor: 'buyAmount', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '평가금액',
        id: 'evaluateAmount',
        accessor: 'evaluateAmount',
        Cell: ({ value, row }) => renderEvaluateAmountInput(row.index, value),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const data = React.useMemo<StockEvaluateModel[]>(() => stockEvaluateList, [stockEvaluateList]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<StockEvaluateModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<StockEvaluateModel>) => {
    const customStyles: CSSProperties = {};

    if (['buyAmount'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <table
      {...getTableProps()}
      className="table-th-center table-font-size table table-dark table-striped table-bordered table-hover"
      style={{ marginTop: '10px' }}
      ref={tableRef}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps((column as any).getSortByToggleProps())}>
                {column.render('Header')}
                <span>{renderSortIndicator(column)}</span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return <tr {...row.getRowProps()}>{row.cells.map((cell) => renderCell(cell))}</tr>;
        })}
      </tbody>
    </table>
  );
}

AssetSnapshotStockListInput.displayName = 'AssetSnapshotStockListInput';
export default AssetSnapshotStockListInput;
