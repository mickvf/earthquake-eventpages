/* global define */
define([
	'util/Util',
	'./MomentTensorPage'
], function (
	Util,
	MomentTensorPage
) {
	'use strict';


	var DEFAULTS = {};

	/**
	 * Construct a new FocalMechanismPage.
	 *
	 * @param options {Object}
	 *        module options.
	 * @see MomentTensorPage.
	 */
	var FocalMechanismPage = function (options) {
		options = Util.extend({}, DEFAULTS, options);
		this._code = options.code;
		MomentTensorPage.call(this, options);
	};

	// extend MomentTensorPage
	FocalMechanismPage.prototype = Object.create(MomentTensorPage.prototype);


	FocalMechanismPage.prototype._getSummaryInfo = function (tensor) {
		var formatter = this._options.formatter,
		    magnitude = tensor.magnitude,
		    author = tensor.source,
		    percentDC = Math.round(tensor.percentDC * 100);

		magnitude = formatter.magnitude(magnitude);

		return [
					'<header class="title">', tensor.title, '</header>',
					'<dl>',
						'<dt>Magnitude:</dt>',
						'<dd>', magnitude, '</dd>',
						'<dt>Percent <abbr title="Double Couple">DC</abbr>:</dt>',
						'<dd>', percentDC, '%</dd>',
						'<dt>Author:</dt>',
						'<dd>', author, '</dd>',
					'</dl>',
		].join('');
	};

	/**
	 * Mechanism info.
	 *
	 * @param tensor {Tensor}
	 *        the focal-mechanism product.
	 * @return {String} info table.
	 */
	FocalMechanismPage.prototype._getInfo = function (tensor) {
		return [
			'<table class="info-table tabular"><tbody>',
			'<tr><th scope="row">Author</th>',
				'<td>', tensor.source, '</td></tr>',
			'<tr><th scope="row">Catalog</th>',
				'<td>', tensor.product.properties.eventsource, '</td></tr>',
			'<tr><th scope="row">Contributor</th>',
				'<td>', tensor.product.source, '</td></tr>',
			'<tr><th scope="row">Code</th>',
				'<td>', tensor.product.code, '</td></tr>',
			'</tbody></table>'
		].join('');
	};

	/**
	 * Mechanism Axes information.
	 *
	 * @return {String} empty string, don't show axes for mechanism.
	 */
	FocalMechanismPage.prototype._getAxes = function () {
		return '';
	};


	// return constructor
	return FocalMechanismPage;
});
