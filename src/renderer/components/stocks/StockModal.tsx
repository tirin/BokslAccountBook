import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OptionNumberType, StockModalForm } from '../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import darkThemeStyles from '../common/BokslConstant';
import { getCodeList } from '../common/CodeMapper';

export interface StockModalHandle {
  openStockModal: (stockSeq: number, saveCallback: () => void) => void;
  hideStockModal: () => void;
}

const StockModal = forwardRef<StockModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<StockModalForm>({
    stockSeq: 1,
    name: '복슬전자',
    stockTypeCode: 0,
    nationCode: 0,
    link: '',
    note: '',
    enableF: true,
  });

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      name: yup.string().required('이름은 필수입니다.'),
      stockTypeCode: yup.number().test('is-not-zero', '종목유형을 선택해 주세요.', (value) => value !== 0),
      nationCode: yup.number().test('is-not-zero', '상장국가를 선택해 주세요.', (value) => value !== 0),
    };
    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StockModalForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  const stockTypeCodeOptions = getCodeList('KIND_CODE');
  const nationCodeOptions = getCodeList('TYPE_ACCOUNT');

  useImperativeHandle(ref, () => ({
    openStockModal: (stockSeq: number, callback: () => void) => {
      setShowModal(true);
      // TODO 값 불러오기
      // setForm(item);
      setForm({ ...form, stockSeq });
      setParentCallback(() => callback);
      reset();
    },
    hideStockModal: () => setShowModal(false),
  }));

  const onSubmit = (data: StockModalForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }
    const input = document.getElementById('accountName');
    input?.focus();
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 종목 {form.stockSeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  이름
                </Form.Label>
                <Col sm={9}>
                  <Form.Control id="accountName" type="text" {...register('name')} maxLength={30} />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  종목유형
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="stockTypeCode"
                    render={({ field }) => (
                      <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                        value={stockTypeCodeOptions.find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={stockTypeCodeOptions}
                        placeholder="종목유형 선택"
                        className="react-select-container"
                        styles={darkThemeStyles}
                      />
                    )}
                  />
                  {errors.stockTypeCode && <span className="error">{errors.stockTypeCode.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  상장국가
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="nationCode"
                    render={({ field }) => (
                      <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                        value={nationCodeOptions.find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={nationCodeOptions}
                        placeholder="상장국가 선택"
                        className="react-select-container"
                        styles={darkThemeStyles}
                      />
                    )}
                  />
                  {errors.nationCode && <span className="error">{errors.nationCode.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  상세정보 링크
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('link')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  메모 내용
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('note')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  활성
                </Form.Label>
                <Col sm={9} className="d-flex align-items-center">
                  <Controller
                    name="enableF"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Form.Check
                          type="radio"
                          id="enableF-yes"
                          label="활성"
                          value="true"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="me-2"
                        />
                        <Form.Check
                          type="radio"
                          id="enableF-no"
                          label="비활성"
                          value="false"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="me-2"
                        />
                      </>
                    )}
                  />
                </Col>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={handleConfirmClick}>
          저장
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
StockModal.displayName = 'AccountModal';

export default StockModal;
