import { parseMarkdownFileContents } from '../lib/utils.js';

class StockModel {
  #stock = {};

  static stock = {
    default: { default: { price: 0, quantity: 0 }, promotion: null },
  };

  #initializeStock(parsedstock) {
    parsedstock.forEach((stock) => {
      const [stockName] = stock;

      this.#stock[stockName] = {
        ...StockModel.stock.default,
      };
    });
  }

  #fillDefaultStockInPromotion(stock) {
    const [stockName, stockPrice, _, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stock[stockName].default = {
      price: Number(stockPrice),
      quantity: 0,
    };
  }

  #fillPromotionStockInPromotion(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stock[stockName].promotion = {
      price: Number(stockPrice),
      quantity: Number(stockQuantity),
      promotion: stockPromotion,
    };
  }

  #fillStockInPromotion(stock) {
    this.#fillDefaultStockInPromotion(stock);
    this.#fillPromotionStockInPromotion(stock);
  }

  #fillStockInDefault(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion !== 'null') return;

    this.#stock[stockName].default.price = Number(stockPrice);
    this.#stock[stockName].default.quantity = Number(stockQuantity);
  }

  #fillStock(parsedstock) {
    parsedstock.forEach((stock) => {
      this.#fillStockInPromotion(stock);
      this.#fillStockInDefault(stock);
    });
  }

  setStock(stock) {
    const parsedstock = parseMarkdownFileContents(stock);

    this.#initializeStock(parsedstock);
    this.#fillStock(parsedstock);
  }

  getStock() {
    return this.#stock;
  }
}

export default StockModel;
