import { describe, expect, it } from 'vitest'

import { createInitialState, formReducer } from '../form-reducer'

describe('engine/core/form-reducer', () => {
  it('createInitialState:值/触碰/提交标记全部为空', () => {
    // Act
    const state = createInitialState()
    // Assert
    expect(state.values).toEqual({})
    expect(state.touched).toEqual({})
    expect(state.submitted).toBe(false)
  })

  it('SET_FIELD 落值;同值重复派发不产生新状态(引用不变)', () => {
    // Arrange
    const state = createInitialState()
    // Act
    const next = formReducer(state, { type: 'SET_FIELD', key: 'name', value: '张三' })
    const again = formReducer(next, { type: 'SET_FIELD', key: 'name', value: '张三' })
    // Assert
    expect(next.values['name']).toBe('张三')
    expect(again).toBe(next)
  })

  it('TOUCH_FIELD 标记触碰;重复派发引用不变', () => {
    // Arrange
    const state = createInitialState()
    // Act
    const next = formReducer(state, { type: 'TOUCH_FIELD', key: 'age' })
    const again = formReducer(next, { type: 'TOUCH_FIELD', key: 'age' })
    // Assert
    expect(next.touched['age']).toBe(true)
    expect(again).toBe(next)
  })

  it('ADD_ROW:undefined 行集起步为 [{}],再追加为两行', () => {
    // Arrange
    const state = createInitialState()
    // Act
    const one = formReducer(state, { type: 'ADD_ROW', key: 'members' })
    const two = formReducer(one, { type: 'ADD_ROW', key: 'members' })
    // Assert
    expect(one.values['members']).toEqual([{}])
    expect(two.values['members']).toEqual([{}, {}])
  })

  it('REMOVE_ROW 按行号删除,其余行保持原值', () => {
    // Arrange
    let state = createInitialState()
    state = formReducer(state, { type: 'ADD_ROW', key: 'members' })
    state = formReducer(state, { type: 'ADD_ROW', key: 'members' })
    state = formReducer(state, {
      type: 'UPDATE_CELL',
      key: 'members',
      row: 0,
      column: 'name',
      value: '甲',
    })
    state = formReducer(state, {
      type: 'UPDATE_CELL',
      key: 'members',
      row: 1,
      column: 'name',
      value: '乙',
    })
    // Act
    const next = formReducer(state, { type: 'REMOVE_ROW', key: 'members', index: 0 })
    // Assert
    expect(next.values['members']).toEqual([{ name: '乙' }])
  })

  it('UPDATE_CELL 定位到目标行目标列,不影响其他行', () => {
    // Arrange
    let state = createInitialState()
    state = formReducer(state, { type: 'ADD_ROW', key: 'members' })
    state = formReducer(state, { type: 'ADD_ROW', key: 'members' })
    // Act
    const next = formReducer(state, {
      type: 'UPDATE_CELL',
      key: 'members',
      row: 1,
      column: 'age',
      value: 30,
    })
    // Assert
    expect(next.values['members']).toEqual([{}, { age: 30 }])
  })

  it('SUBMIT_ATTEMPT 置位提交标记,重复派发引用不变;RESET 回到初始', () => {
    // Arrange
    let state = createInitialState()
    state = formReducer(state, { type: 'SET_FIELD', key: 'name', value: '张三' })
    // Act
    const attempted = formReducer(state, { type: 'SUBMIT_ATTEMPT' })
    const again = formReducer(attempted, { type: 'SUBMIT_ATTEMPT' })
    const reset = formReducer(attempted, { type: 'RESET' })
    // Assert
    expect(attempted.submitted).toBe(true)
    expect(again).toBe(attempted)
    expect(reset).toEqual(createInitialState())
  })
})
