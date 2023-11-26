import { Button, Col } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import { EventApi, EventContentArg } from '@fullcalendar/common';
import eventIconMap from './eventIconMap';
import getAnniversary, { Anniversary } from '../../utils/DateUtil';
import ContextMenu from './ContextMenu';
import TransactionModal, { TransactionModalHandle } from '../common/TransactionModal';
import {
  AccountType,
  Currency,
  ExchangeKind,
  ExchangeModalForm,
  TradeKind,
  TradeModalForm,
  TransactionKind,
  TransactionModalForm,
} from '../common/BokslTypes';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';
import MemoModal, { MemoModalHandle } from '../common/MemoModal';

export interface CalendarPartMethods {
  reloadLedger: () => void;
}

interface CalendarPartProps {
  onChangeDate: (message: Date) => void;
}

// 이벤트 객체에 icon 속성을 추가하기 위한 인터페이스 확장
interface ExtendedEventApi extends EventApi {
  extendedProps: {
    icon?: React.ReactNode;
    backgroundColor?: React.ReactNode;
  };
}

// TODO CalendarPart 함수안에 있으면 안되는데 여기어 있으면 정상 동작. 원인 파악
const anniversaries: Anniversary[] = [];

const CalendarPart = forwardRef<CalendarPartMethods, CalendarPartProps>((props, ref) => {
  const [events, setEvents] = useState<Array<any>>([]);
  const [isOpen, setOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [selectDate, setSelectDate] = useState<Date>(new Date());

  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const tradeModalRef = useRef<TradeModalHandle>(null);
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);
  const memoModalRef = useRef<MemoModalHandle>(null);

  // 외부에서 호출할 수 있는 함수를 정의
  useImperativeHandle(ref, () => ({
    reloadLedger: () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        console.log('원장 다시 계산');
      }
    },
  }));
  const getCurrentMonthStartDate = () => {
    if (!calendarRef.current) {
      return new Date();
    }
    const calendarApi = calendarRef.current.getApi();
    const { view } = calendarApi;
    const { currentStart } = view;
    return currentStart;
  };

  const addRandomEvent = () => {
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1일부터 28일 사이의 랜덤한 날짜
    const currentDate = getCurrentMonthStartDate();

    const keys = Object.keys(eventIconMap);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const icon = eventIconMap[randomKey];

    const newEvent = {
      id: Date.now().toString(), // 유니크한 ID 생성
      title: 'Random Event',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), randomDay),
      icon,
    };
    setEvents([...events, newEvent]);
  };

  const removeAllEvents = () => {
    setEvents([]);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event as ExtendedEventApi;
    return (
      <div>
        {event.extendedProps.icon}
        <span style={{ marginLeft: '4px' }} title={event.title}>
          {event.title}
        </span>
      </div>
    );
  };

  function emitSelectDate(date: Date) {
    const { current } = calendarRef;
    if (!current) {
      return;
    }
    const calendarApi = current.getApi();
    calendarApi.select(date);
  }

  const renderDayCellContent = (dateValue: any) => {
    const date = dateValue.date as Date;
    const dateStr = moment(date).format('YYYY-MM-DD');
    const anniversariesForDay = anniversaries.filter((a) => a.date === dateStr);

    const anniversaryNames = anniversariesForDay.map((a) => a.event.name).join(', ');
    const isHoliday = anniversariesForDay.some((a) => a.event.holiday);

    return (
      <>
        <span className="anniversary-name">{anniversaryNames}</span>
        <span className={`day-number ${isHoliday ? 'holiday' : ''}`}>{date.getDate()}</span>
      </>
    );
  };

  /**
   * 날짜를 선택
   */
  const handleDateSelect = (selectInfo: any) => {
    setOpen(false);
    const { start } = selectInfo;
    setSelectDate(start);
    const calendarEl = calendarContainerRef.current;

    // 날짜를 선택하고 포커스를 잃었을 때 배경색이 되돌아 오는것을 방지
    // 직접 DOM 조작했음
    if (calendarEl) {
      calendarEl.querySelectorAll('.fc-day').forEach((day) => {
        day.classList.remove('cal-select');
      });

      const selectedDay = calendarEl.querySelector(`.fc-day[data-date='${moment(start).format('YYYY-MM-DD')}']`);
      if (selectedDay) {
        selectedDay.classList.add('cal-select');
      }

      props.onChangeDate(start);
    }
  };

  /**
   * 년도 또는 월 이동 시 이벤트
   */
  const handleDatesSet = () => {
    const currentDate = getCurrentMonthStartDate();
    emitSelectDate(currentDate);
    removeAllEvents();

    const anniversary = getAnniversary(currentDate.getFullYear());
    anniversaries.length = 0;
    anniversaries.push(...anniversary);
  };

  /**
   * 이벤트 항목 클릭 시 달력 셀(날짜) 클릭 효과 부여
   */
  const handleEventClick = (eventClickArg: any) => {
    const date = eventClickArg.event.start;
    emitSelectDate(date);
  };

  async function loadEvent(currentDate: Date) {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      console.log('이벤트 로드 로직 추가');
      addRandomEvent();
    }
  }

  const contextMenuClick = (action: AccountType) => {
    console.log('Selected action:', action);
    if (action === AccountType.EXPENSE) {
      const item: TransactionModalForm = {
        transactionDate: selectDate,
        categorySeq: 0,
        kind: TransactionKind.EXPENSE,
        note: '',
        money: 0,
        payAccount: 0,
        receiveAccount: 0,
        attribute: '',
        fee: 0,
      };

      transactionModalRef.current?.openTransactionModal(TransactionKind.EXPENSE, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.INCOME) {
      const item: TransactionModalForm = {
        transactionDate: selectDate,
        categorySeq: 0,
        kind: TransactionKind.INCOME,
        note: '',
        money: 0,
        payAccount: 0,
        receiveAccount: 0,
        attribute: '',
        fee: 0,
      };

      transactionModalRef.current?.openTransactionModal(TransactionKind.INCOME, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.TRANSFER) {
      const item: TransactionModalForm = {
        transactionDate: selectDate,
        categorySeq: 0,
        kind: TransactionKind.TRANSFER,
        note: '',
        money: 0,
        payAccount: 0,
        receiveAccount: 0,
        attribute: '',
        fee: 0,
      };

      transactionModalRef.current?.openTransactionModal(TransactionKind.TRANSFER, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.BUY) {
      const item: TradeModalForm = {
        tradeDate: selectDate,
        accountSeq: 0,
        stockSeq: 0,
        note: '',
        kind: TradeKind.BUY,
        quantity: 0,
        price: 0,
        tax: 0,
        fee: 0,
      };
      tradeModalRef.current?.openTradeModal(TradeKind.BUY, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.SELL) {
      const item: TradeModalForm = {
        tradeDate: selectDate,
        accountSeq: 0,
        stockSeq: 0,
        note: '',
        kind: TradeKind.SELL,
        quantity: 0,
        price: 0,
        tax: 0,
        fee: 0,
      };
      tradeModalRef.current?.openTradeModal(TradeKind.SELL, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.EXCHANGE_BUY) {
      const item: ExchangeModalForm = {
        exchangeDate: new Date(),
        accountSeq: 0,
        note: '안녕',
        currencyToSellCode: Currency.KRW,
        currencyToSellPrice: 10000,
        currencyToBuyCode: Currency.USD,
        currencyToBuyPrice: 8.55,
        fee: 5,
      };
      exchangeModalRef.current?.openExchangeModal(ExchangeKind.BUY, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.EXCHANGE_SELL) {
      const item: ExchangeModalForm = {
        exchangeDate: new Date(),
        accountSeq: 0,
        note: '안녕',
        currencyToSellCode: Currency.KRW,
        currencyToSellPrice: 10000,
        currencyToBuyCode: Currency.USD,
        currencyToBuyPrice: 8.55,
        fee: 5,
      };
      exchangeModalRef.current?.openExchangeModal(ExchangeKind.SELL, item, () => {
        console.log('저장 완료 reload');
      });
    } else if (action === AccountType.MEMO) {
      const item = {
        memoDate: new Date(),
        note: '안녕',
      };
      memoModalRef.current?.openMemoModal(item, () => {
        console.log('저장 완료 reload');
      });
    }
  };

  // 컴포넌트가 처음 마운트 되었을 때 한번만 실행
  useEffect(() => {
    loadEvent(getCurrentMonthStartDate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Col
      ref={calendarContainerRef}
      onContextMenu={(e) => {
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) return;

        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setOpen(true);
      }}
    >
      <Button onClick={addRandomEvent}>이벤트 추가</Button>
      <Button onClick={removeAllEvents}>이벤트 전체 제거</Button>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        selectable
        selectConstraint={{
          start: '00:00',
          end: '24:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        }}
        showNonCurrentDates={false}
        dayCellContent={renderDayCellContent}
        datesSet={handleDatesSet}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        events={events}
        headerToolbar={{
          left: '',
          center: 'title',
          right: 'prevYear,prev,next,nextYear today',
        }}
        height="auto"
      />
      <ContextMenu anchorPoint={anchorPoint} isOpen={isOpen} onClose={() => setOpen(false)} onMenuItemClick={contextMenuClick} />
      <TransactionModal ref={transactionModalRef} />
      <TradeModal ref={tradeModalRef} />
      <ExchangeModal ref={exchangeModalRef} />
      <MemoModal ref={memoModalRef} />
    </Col>
  );
});

export default CalendarPart;
