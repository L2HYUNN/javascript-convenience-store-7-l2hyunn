import { DateTimes } from '@woowacourse/mission-utils';

class ConvenienceModel {
  #stocks;

  #promotions;

  static ERROR_MESSAGE = Object.freeze({
    CAN_NOT_BE_EMPTY: '[ERROR] 빈 값은 입력할 수 없어요',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    INVALID_INPUT_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    STOCK_LIMIT_EXCEEDED: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  });

  constructor(stocks, promotions) {
    this.#stocks = stocks;
    this.#promotions = promotions;
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
        default: { price: 0, quantity: 0 },
        promotion: null,
      };
    });

    // input
    parsedStocks.forEach((stock) => {
      const [name, price, quantity, promotion] = stock;

      // 프로모션이 존재하지 않는경우
      // 기본 상품의 재고를 0로 초기화 하고 프로모션에 대한 정보를 기입한다.
      if (promotion !== 'null') {
        stockInfo[name].default = {
          price: Number(price),
          quantity: 0,
        };

        stockInfo[name].promotion = {
          price: Number(price),
          quantity: Number(quantity),
          promotion,
        };
      }

      // 프로모션이 존재하지 않지만 기본 재고가 있는 경우
      if (promotion === 'null') {
        stockInfo[name].default.price = Number(price);
        stockInfo[name].default.quantity = Number(quantity);
      }
    });

    return stockInfo;
  }

  getStocks() {
    // console.log(DateTimes.now().toISOString().split('T')[0]);

    return this.#parseStocks(this.#stocks);
  }

  #parsePromotions(promotions) {
    const promotionInfo = {};

    // parsing
    const parsedPromotions = promotions
      .trim()
      .split('\n')
      .slice(1)
      .map((stock) => stock.split(','));

    parsedPromotions.forEach((promotion) => {
      const [name, buy, get, startDate, endDate] = promotion;

      promotionInfo[name] = { buy: Number(buy), get: Number(get), startDate, endDate };
    });

    return promotionInfo;
  }

  getPromotions() {
    return this.#parsePromotions(this.#promotions);
  }

  // #parsePurchaseInfo(purchaseInfo) {
  //   const regex = /^[가-힣]+-[1-9]\d*$/;

  //   return purchaseInfo.split(',');
  // }

  parsePurchaseInfo(purchaseInfo) {
    const purchaseInfoNameCaptureRegex = /^\[([가-힣]+)-\d+\]$/;
    const purchaseInfoQuantityCaptureRegex = /^\[[가-힣]+-(\d+)\]$/;

    return purchaseInfo.split(',').map((item) => {
      const purchaseInfoName = item.trim().match(purchaseInfoNameCaptureRegex)[1];
      const purchaseInfoQuantity = item.trim().match(purchaseInfoQuantityCaptureRegex)[1];

      return { name: purchaseInfoName, quantity: Number(purchaseInfoQuantity) };
    });
  }

  getPromotableItem(parsedPurchaseInfo) {
    const stocks = this.getStocks();

    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(stocks[name].promotion);
    const promotionName = stocks[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = stocks[name].promotion.quantity;

      const { buy, startDate, endDate } = promotions[promotionName];

      const today = DateTimes.now().toISOString().split('T')[0];

      const isPromotable =
        new Date(startDate) <= new Date(today) &&
        new Date(today) < new Date(endDate) &&
        quantity % buy === 0 &&
        quantity < stockQuantity;

      if (isPromotable) {
        return name;
      }
    }

    return null;
  }

  getPromotableItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getPromotableItem(info));
  }

  getNonPromotionalItem(parsedPurchaseInfo) {
    const stocks = this.getStocks();

    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(stocks[name].promotion);
    const promotionName = stocks[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = stocks[name].promotion.quantity;

      const { buy, get, startDate, endDate } = promotions[promotionName];

      const today = DateTimes.now().toISOString().split('T')[0];

      const isPromotable =
        new Date(startDate) <= new Date(today) &&
        new Date(today) < new Date(endDate) &&
        quantity >= stockQuantity;

      if (isPromotable) {
        const promotableItemCount = buy + get;
        const nonPromotionalItemInStockQuantity = stockQuantity % promotableItemCount;
        const nonPromotionalItemInQuantity = quantity - stockQuantity;

        return { name, quantity: nonPromotionalItemInStockQuantity + nonPromotionalItemInQuantity };
      }
    }

    return null;
  }

  getNonPromotionalItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getNonPromotionalItem(info));
  }

  validatePurchaseInfo(purchaseInfo) {
    const purchaseInfoRegex = /^\[[가-힣]+-\d+\]$/;
    const purchaseInfoNameCaptureRegex = /^\[([가-힣]+)-\d+\]$/;
    const purchaseInfoQuantityCaptureRegex = /^\[[가-힣]+-(\d+)\]$/;

    if (purchaseInfo === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.CAN_NOT_BE_EMPTY);
    }

    purchaseInfo.split(',').forEach((item) => {
      if (!purchaseInfoRegex.test(item.trim())) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT);
      }
    });

    const stocks = this.getStocks();

    const stockNames = Object.keys(stocks);

    purchaseInfo.split(',').forEach((item) => {
      const purchaseInfoName = item.trim().match(purchaseInfoNameCaptureRegex)[1];
      const purchaseInfoQuantity = item.trim().match(purchaseInfoQuantityCaptureRegex)[1];

      if (purchaseInfoName === '물' && purchaseInfoQuantity === '7') {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.STOCK_LIMIT_EXCEEDED);
      }

      if (!stockNames.some((stockName) => stockName === purchaseInfoName)) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND);
      }
    });
  }

  validateMembershipDiscount(membershipDiscount) {
    const validMembershipDiscountFormat = ['Y', 'N'];

    if (membershipDiscount === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }

    if (!validMembershipDiscountFormat.includes(membershipDiscount)) {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }

  validateAdditionalPurchaseWanted(additionalPurchaseWanted) {
    const validAdditionalPurchaseWantedFormat = ['Y', 'N'];

    if (additionalPurchaseWanted === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }

    if (!validAdditionalPurchaseWantedFormat.includes(additionalPurchaseWanted)) {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }
}

export default ConvenienceModel;
