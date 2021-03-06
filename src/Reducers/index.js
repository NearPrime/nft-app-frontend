import { combineReducers } from "redux";

// -------These reducer files will be created in Reducers folder then will be imported here
import Menu__ToolTip from "./menu__tooltip";
import Home__AllNft from "./home__allnft";
import LoginFormMethod from "./LoginFormMethod";
import CreateNft__Popup from "./createnft__popup";
import SendNft__Popup from "./sendnft__popup";
import NFT__Detail from "./nft__detail";
import GiftNFT_Dialog_Box from "./GiftNFT_Dialog_Box";
import giftNFT__contactData from "./giftNFT__contactData";

import authReducer from "./authReducer";
import transactionsReducer from "./transactionsReducer";
import nftReducer from './nftReducer';
import { LOGOUT } from "./ActionTypes";

// Here all reducers will get combined
const appReducer = combineReducers({
  giftNFT__contactData,
  menu__tooltip: Menu__ToolTip,
  home__allnft: Home__AllNft,
  LoginFormMethod,
  createnft__popup: CreateNft__Popup,
  sendnft__popup: SendNft__Popup,
  nft__detail: NFT__Detail,
  GiftNFT_Dialog_Box,
  authReducer,
  transactionsReducer,
  nftReducer
});

export default (state, action) => {
  if (action.type === LOGOUT) {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}
