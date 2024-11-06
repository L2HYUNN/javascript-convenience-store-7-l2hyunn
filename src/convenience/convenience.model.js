class ConvenienceModel {
  #stocks;

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
}

export default ConvenienceModel;
