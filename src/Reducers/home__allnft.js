const initialvalue = {
  nfts: [],
  onlyOneContactShare: false
};

const AllNFT = (state = initialvalue, action) => {
  switch (action.type) {
    /*  case "getNft":
      return action.payload.sort((a, b) => (b.id > a.id ? 1 : -1)); //We spread the last
      state because this is a pure reducer function meaning every time we call it, it will
      return a new state so ...state means it will not forget the old state if the
      function is called again
    case "addNewNft":
      return [action.payload, ...state]; */
    case "onlyOneContactShare":
      return { ...state, onlyOneContactShare: true };
    case "update_nfts":
      return {
        ...state,
        nfts: action.payload.filter(n => n.status !== "unclaimed_gift"),
      };
    default:
      return state;
  }
};
export default AllNFT;
