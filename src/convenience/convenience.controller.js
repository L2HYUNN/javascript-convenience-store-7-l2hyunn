import { read } from '../lib/file.js';
import ConvenienceModel from './convenience.model.js';
import ConvenienceView from './convenience.view.js';

class ConvenienceController {
  #view;

  #model;

  constructor(
    view = new ConvenienceView(),
    model = new ConvenienceModel(
      read('../../public/products.md'),
      read('../../public/promotions.md'),
    ),
  ) {
    this.#view = view;
    this.#model = model;
  }

  async init() {
    this.#view.printWelcomeMessage();

    this.#view.printStocksInfo();

    this.#view.printStocks(this.#model.getStocks());

    const purchaseInfo = await this.#view.getPurcharseInfo();
    this.#view.printLineBreak();

    this.#model.validatePurchaseInfo(purchaseInfo);
    const parsedPurchaseInfo = this.#model.parsePurchaseInfo(purchaseInfo);
    const promotableItems = this.#model.getPromotableItems(parsedPurchaseInfo);
    const shouldAddItemForPromotionList = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const promotableItem of promotableItems) {
      if (promotableItem === null) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const answer = await this.#view.getShouldAddItemForPromotion(promotableItem);
      this.#view.printLineBreak();

      // answer validation

      if (answer === 'Y') {
        shouldAddItemForPromotionList.push(promotableItem);
      }
    }

    console.log(shouldAddItemForPromotionList);
  }
}

export default ConvenienceController;
