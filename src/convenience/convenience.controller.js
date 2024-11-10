/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
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

    for (const promotableItem of promotableItems) {
      if (promotableItem === null) {
        continue;
      }

      const answer = await this.#view.getShouldAddItemForPromotion(promotableItem);
      this.#view.printLineBreak();

      // answer validation

      if (answer === 'Y') {
        shouldAddItemForPromotionList.push(promotableItem);
      }
    }

    const nonPromotionalItems = this.#model.getNonPromotionalItems(parsedPurchaseInfo);
    const shouldAddItemWithoutPromotionList = [];

    for (const nonPromotionalItem of nonPromotionalItems) {
      if (nonPromotionalItem === null) {
        continue;
      }

      const answer = await this.#view.getShouldAddItemWithoutPromotion(
        nonPromotionalItem.name,
        nonPromotionalItem.quantity,
      );
      this.#view.printLineBreak();

      if (answer === 'Y') {
        shouldAddItemWithoutPromotionList.push({
          name: nonPromotionalItem.name,
          quantity: nonPromotionalItem.quantity,
        });
      }
    }

    console.log(shouldAddItemWithoutPromotionList);
  }
}

export default ConvenienceController;
