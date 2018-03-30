/* eslint-env mocha */
import Vue from 'vue-test'; // eslint-disable-line
import Vuex from 'vuex';
import assert from 'assert';
import { mount } from '@vue/test-utils';
import UserTable from '../../src/views/user-table.vue';

const defaultProps = {
  users: [
    { id: 'user_1', kind: 'learner', full_name: 'User One' },
    { id: 'user_2', kind: 'learner', full_name: 'User Two' },
    { id: 'user_3', kind: 'learner', full_name: 'User Three' },
    { id: 'user_4', kind: 'learner', full_name: 'User Four' },
  ],
  value: [],
  selectable: true,
};

function makeWrapper(options) {
  options.store = new Vuex.Store();
  const wrapper = mount(UserTable, options);
  const els = {
    selectAllCheckbox: () => wrapper.find({ name: 'kCheckbox' }),
  };
  return { wrapper, els };
}

describe('UserTable', () => {
  it('checking select all selects all the users', () => {
    const { wrapper, els } = makeWrapper({
      propsData: { ...defaultProps },
    });
    els.selectAllCheckbox().vm.$emit('change', true);
    assert.deepEqual(wrapper.emitted().input[0][0], defaultProps.users.map(({ id }) => id));
  });

  it('unchecking "select all" unselects all the users', () => {
    const { wrapper, els } = makeWrapper({
      propsData: { ...defaultProps },
    });
    els.selectAllCheckbox().vm.$emit('change', true);
    els.selectAllCheckbox().vm.$emit('change', false);
    assert.deepEqual(wrapper.emitted().input[0][0], defaultProps.users.map(({ id }) => id));
    assert.deepEqual(wrapper.emitted().input[1][0], []);
  });

  // not tested
  // data in rows
  // selecting single user
  // more complicated scenarios with select all
  // pagination
  // clicking submit
});
