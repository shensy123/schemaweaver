'use client'

/**
 * 表单引擎 React 薄壳:useReducer 持状态,联动/校验/渲染树由引擎纯函数现算(D5 拍板)。
 * 出处:briefs 03——M2 UI 薄壳层;错误显示门槛 = 字段已触碰或整表已提交尝试。
 * 约束:hook 不含业务逻辑,仅做 dispatch 包装与 memo 派生;UI 薄壳不强求组件测试。
 */
import { useCallback, useMemo, useReducer } from 'react'

import type { FieldError } from '@/engine/core/types'
import { createInitialState, formReducer } from '@/engine/core/form-reducer'
import { evaluateVisibility } from '@/engine/linkage/visibility'
import type { RenderNode } from '@/engine/renderer/resolve'
import { resolveRenderTree } from '@/engine/renderer/resolve'
import { validateForm } from '@/engine/validation/form'
import type { FormSchema, FormValues } from '@/schema/types'

export interface UseFormEngineResult {
  values: FormValues
  submitted: boolean
  renderNodes: RenderNode[]
  errors: FieldError[]
  errorKeys: Set<string>
  valid: boolean
  /** 错误可见门槛:整表提交尝试过,或该字段已触碰 */
  shouldShow(fieldKey: string): boolean
  /** 取某字段全部错误(含 array 行列定位) */
  fieldErrors(fieldKey: string): FieldError[]
  setField(key: string, value: unknown): void
  touchField(key: string): void
  addRow(key: string): void
  removeRow(key: string, index: number): void
  updateCell(key: string, row: number, column: string, value: unknown): void
  submitAttempt(): void
  reset(): void
}

export function useFormEngine(schema: FormSchema): UseFormEngineResult {
  const [state, dispatch] = useReducer(formReducer, undefined, createInitialState)

  const visibleKeys = useMemo(
    () => evaluateVisibility(schema.fields, state.values).visibleKeys,
    [schema, state.values],
  )
  const renderNodes = useMemo(
    () => resolveRenderTree(schema.fields, visibleKeys),
    [schema, visibleKeys],
  )
  const { errors, valid, errorKeys } = useMemo(
    () => validateForm(schema, state.values, visibleKeys),
    [schema, state.values, visibleKeys],
  )

  const setField = useCallback((key: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', key, value })
  }, [])
  const touchField = useCallback((key: string) => {
    dispatch({ type: 'TOUCH_FIELD', key })
  }, [])
  const addRow = useCallback((key: string) => {
    dispatch({ type: 'ADD_ROW', key })
  }, [])
  const removeRow = useCallback((key: string, index: number) => {
    dispatch({ type: 'REMOVE_ROW', key, index })
  }, [])
  const updateCell = useCallback((key: string, row: number, column: string, value: unknown) => {
    dispatch({ type: 'UPDATE_CELL', key, row, column, value })
  }, [])
  const submitAttempt = useCallback(() => {
    dispatch({ type: 'SUBMIT_ATTEMPT' })
  }, [])
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const shouldShow = useCallback(
    (fieldKey: string) => state.submitted || state.touched[fieldKey] === true,
    [state.submitted, state.touched],
  )
  const fieldErrors = useCallback(
    (fieldKey: string) => errors.filter((error) => error.fieldKey === fieldKey),
    [errors],
  )

  return {
    values: state.values,
    submitted: state.submitted,
    renderNodes,
    errors,
    errorKeys,
    valid,
    shouldShow,
    fieldErrors,
    setField,
    touchField,
    addRow,
    removeRow,
    updateCell,
    submitAttempt,
    reset,
  }
}
