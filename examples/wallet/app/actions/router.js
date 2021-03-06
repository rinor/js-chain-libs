// @flow
import { push } from 'connected-react-router';
import type { Dispatch, GetState } from '../reducers/types';
import type { Address } from '../models';
import routes from '../constants/routes.json';
import {
  updateAccountTransactionsAndState,
  ACCOUNT_STATE_ERROR
} from './account';
import { readAccountKeysFromLocalStorage } from '../utils/storage';

export const SET_KEYS = 'SET_KEYS';

// eslint-disable-next-line import/prefer-default-export
export const redirectToFirstAppPage = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const accountKeys = readAccountKeysFromLocalStorage();
    if (accountKeys) {
      dispatch({
        type: SET_KEYS,
        ...accountKeys
      });
      return dispatch(updateAccountTransactionsAndState()).catch(error => {
        if (error.message === ACCOUNT_STATE_ERROR) {
          console.error('There was an error retrieving account status');
        }

        return dispatch(push(routes.WALLET));
      });
    }
    const {
      account: { address }
    }: { account: { address: Address } } = getState();
    if (address) {
      return dispatch(push(routes.WALLET));
    }
    return dispatch(push(routes.CHOOSE_RESTORE_OR_IMPORT));
  };
};
