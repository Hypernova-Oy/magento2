/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'underscore',
    'jquery',
    'mage/translate',
    'Magento_PageBuilder/js/form/provider/conditions-data-processor',
    'Magento_Ui/js/form/element/abstract'
], function (_, $, $t, conditionsDataProcessor, Abstract) {
    'use strict';

    return Abstract.extend({
        defaults: {
            conditionOption: '',
            conditionValue: '',
            formData: {},
            totalProductCount: 0,
            totalDisabledProducts: 0,
            totalNotVisibleProducts: 0,
            totalOutOfStockProducts: 0,
            category_ids: '',
            listens: {
                conditionOption: 'updateProductTotals',
                conditionValue: 'updateProductTotals',
                category_ids: 'updateProductTotals'
            },
            imports: {
                formData: '${ $.provider }:data'
            },
            links: {
                value: false
            },
            url: null,
            valuePlaceholder: $t('of %1 total'),
            disabledPlaceholder: $t('%1 disabled'),
            notVisiblePlaceholder: $t('%1 not visible'),
            outOfStockPlaceholder: $t('%1 out of stock'),
            showSpinner: true,
            loading: false
        },

        /** @inheritdoc */
        initObservable: function () {
            return this._super()
                .observe('value totalProductCount totalDisabledProducts totalNotVisibleProducts ' +
                    'totalOutOfStockProducts loading');
        },

        /**
         * Update product count.
         *
         */
        updateProductTotals: _.debounce(function () {
            var totalText,
                negativeTotals = [];

            if (!this.conditionOption || _.isEmpty(this.formData)) {
                return;
            }

            if (this.conditionOption === 'category_ids' && typeof this.formData['category_ids'] != 'string') {
                this.formData['category_ids'] = '';
            }

            _.extend(this.formData, this.conditionValue);
            conditionsDataProcessor(this.formData, this.conditionOption + '_source');

            this.loading(true);
            $.ajax({
                url: this.url,
                method: 'POST',
                data: {
                    conditionValue: this.formData['conditions_encoded']
                }
            }).done(function (response) {
                this.totalProductCount(parseInt(response.total, 10));
                this.totalDisabledProducts(parseInt(response.disabled, 10));
                this.totalNotVisibleProducts(parseInt(response.notVisible, 10));
                this.totalOutOfStockProducts(parseInt(response.outOfStock, 10));
                totalText = this.valuePlaceholder
                    .replace('%1', parseInt(response.total, 10));

                if (parseInt(response.disabled, 10) > 0) {
                    negativeTotals.push(this.disabledPlaceholder.replace('%1', parseInt(response.disabled, 10)));
                }

                if (parseInt(response.notVisible, 10) > 0) {
                    negativeTotals.push(this.notVisiblePlaceholder.replace('%1', parseInt(response.notVisible, 10)));
                }

                if (parseInt(response.outOfStock, 10) > 0) {
                    negativeTotals.push(this.outOfStockPlaceholder.replace('%1', parseInt(response.outOfStock, 10)));
                }

                if (negativeTotals.length > 0) {
                    totalText += ' (' + negativeTotals.join(', ') + ')';
                }

                this.value(totalText);
                this.loading(false);
            }.bind(this)).fail(function () {
                this.value($t('An unknown error occurred. Please try again.'));
                this.loading(false);
            }.bind(this));
        }, 10)
    });
});
