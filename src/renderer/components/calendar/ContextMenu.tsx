import React from 'react';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineDollar, AiOutlineMinusCircle, AiOutlineMinusSquare, AiOutlinePlusCircle, AiOutlinePlusSquare } from 'react-icons/ai';
import { AccountType } from '../common/BokslTypes';

interface ContextMenuProps {
  anchorPoint: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  onMenuItemClick: (action: AccountType) => void;
}

function ContextMenuComponent({ anchorPoint, isOpen, onClose, onMenuItemClick }: ContextMenuProps) {
  return (
    <ControlledMenu theming="dark" anchorPoint={anchorPoint} state={isOpen ? 'open' : 'closed'} direction="right" onClose={onClose}>
      <MenuItem onClick={() => onMenuItemClick(AccountType.EXPENSE)}>
        <AiOutlineMinusSquare color="#00bb33" style={{ marginBottom: 1, marginRight: 10 }} /> 지출
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.INCOME)}>
        <AiOutlinePlusSquare color="#ff99cc" style={{ marginBottom: 1, marginRight: 10 }} /> 수입
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.TRANSFER)}>
        <FaExchangeAlt color="#66ccff" style={{ marginBottom: 1, marginRight: 10 }} /> 이체
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.BUY)}>
        <AiOutlinePlusCircle color="#f51818" style={{ marginBottom: 1, marginRight: 10 }} /> 매수
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.SELL)}>
        <AiOutlineMinusCircle color="#1b61d1" style={{ marginBottom: 1, marginRight: 10 }} /> 매도
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.EXCHANGE)}>
        <AiOutlineDollar color="#add8e6" style={{ marginBottom: 1, marginRight: 10 }} /> 환전
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick(AccountType.MEMO)}>
        <FaStickyNote color="grey" style={{ marginBottom: 1, marginRight: 10 }} /> 메모
      </MenuItem>
    </ControlledMenu>
  );
}

export default ContextMenuComponent;