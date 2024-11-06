class ConvenienceModel {
  #stocks;

  static ERROR_MESSAGE = Object.freeze({
    CAN_NOT_BE_EMPTY: '[ERROR] 빈 값은 입력할 수 없어요',
    INVALID_INPUT_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
  });

  constructor(stocks) {
    this.#stocks = stocks;
  }

  #parseStocks(stocks) {
    const stockInfo = {};

    // parsing
    const parsedStocks = stocks
      .trim()
      .split('\n')
      .slice(1)
      .map((stock) => stock.split(','));

    // init
    parsedStocks.forEach((stock) => {
      const [name] = stock;

      stockInfo[name] = {
        default: { price: 0, quantitiy: 0 },
        promotion: null,
      };
    });

    // input
    parsedStocks.forEach((stock) => {
      const [name, price, quantitiy, promotion] = stock;

      // 프로모션이 존재하지 않는경우
      // 기본 상품의 재고를 0로 초기화 하고 프로모션에 대한 정보를 기입한다.
      if (promotion !== 'null') {
        stockInfo[name].default = {
          price: Number(price),
          quantitiy: 0,
        };

        stockInfo[name].promotion = {
          price: Number(price),
          quantitiy: Number(quantitiy),
          promotion,
        };
      }

      // 프로모션이 존재하지 않지만 기본 재고가 있는 경우
      if (promotion === 'null') {
        stockInfo[name].default.price = Number(price);
        stockInfo[name].default.quantitiy = Number(quantitiy);
      }
    });

    return stockInfo;
  }

  getStocks() {
    return this.#parseStocks(this.#stocks);
  }

  // #parsePurchaseInfo(purchaseInfo) {
  //   const regex = /^[가-힣]+-[1-9]\d*$/;

  //   return purchaseInfo.split(',');
  // }

  validatePurchaseInfo(purchaseInfo) {
    const purchaseInfoRegex = /^\[[가-힣]+-[1-9]\d*\]$/;
    const purchaseInfoNameCaptureRegex = /^\[([가-힣]+)-[1-9]\d*\]$/;

    if (purchaseInfo === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.CAN_NOT_BE_EMPTY);
    }

    purchaseInfo.split(',').forEach((item) => {
      if (!purchaseInfoRegex.test(item.trim())) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT);
      }
    });

    const stockNames = Object.keys(this.getStocks());

    purchaseInfo.split(',').forEach((item) => {
      const purchaseInfoName = item.trim().match(purchaseInfoNameCaptureRegex)[1];

      if (!stockNames.some((stockName) => stockName === purchaseInfoName)) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND);
      }
    });
  }
}

export default ConvenienceModel;
