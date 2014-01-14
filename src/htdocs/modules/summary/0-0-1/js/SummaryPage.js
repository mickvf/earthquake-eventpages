/* global define */
define([
	'summary/Attribution',
	'base/EventModulePage',

	'util/Xhr',
	'util/Util'
], function (
	Attribution,
	EventModulePage,

	Xhr,
	Util
) {
	'use strict';
	var DEFAULTS = {
		snippetLength: 100
	};
	var SummaryPage = function (options) {
		options = Util.extend({}, DEFAULTS, options || {});
		EventModulePage.call(this, options);
		this._snippetLength = options.snippetLength;
	};
	SummaryPage.prototype = Object.create(EventModulePage.prototype);

	SummaryPage.prototype._setContentMarkup = function () {
		var _this = this,
		    markup = [],
		    generalHeader,
		    mapContainer,
		    nearbyCities,
		    tectonicSummary,
		    generalText,
		    impactText;

		// DEBUG
		console.log(this._event);

		markup.push(this._getTextContentMarkup('general-header'));

		markup.push(this._getMapMarkup());

		markup.push(this._getTextContentMarkup('nearby-cities'));
		markup.push(this._getTextContentMarkup('tectonic-summary'));
		markup.push(this._getTextContentMarkup('general-text'));
		markup.push(this._getTextContentMarkup('impact-text'));

		markup.push(this._getRelatedLinksMarkup());
		markup.push(this._getAttributionMarkup());

		this._content.innerHTML = markup.join('');

		// Store references to containing elements for faster access
		generalHeader = this._content.querySelector('.summary-general-header');
		mapContainer = this._content.querySelector('.summary-map');
		nearbyCities = this._content.querySelector('.summary-nearby-cities');
		tectonicSummary = this._content.querySelector('.summary-tectonic-summary');
		generalText = this._content.querySelector('.summary-general-text');
		impactText = this._content.querySelector('.summary-impact-text');

		// Fetch AJAX content and load it into the containers
		Xhr.ajax({
				url: this._event.properties.products.geoserve[0]
						.contents['geoserve.json'].url,
				success: function (geoserve) {
					var i,
					    city,
					    cities,
					    len;

					if (mapContainer) {
						_this._loadStaticMapContent(mapContainer, geoserve.cities);
					}

					if (nearbyCities !== null) {
						cities = ['<ol class="staticmap">'];
						for (i = 0, len = geoserve.cities.length; i < len; i++) {
							city = geoserve.cities[i];
							cities.push('<li>' + city.distance +
								'km ' + city.direction +
								' of ' + city.name +
								'</li>');
						}
						cities.push('</ol>');
						nearbyCities.innerHTML = '<h3>Nearby Cities</h3>' + cities.join('');
					}
					// Shorten tectonic summary if the window is less than 768px
					// Read More is clickable to expand text to full size.
					if (tectonicSummary !== null) {
						_this._setTextContent(tectonicSummary, 'Tectonic Summary',
								geoserve.tectonicSummary.text);
					}
				},
				error: function () {
					nearbyCities.parentNode.removeChild(nearbyCities);
					tectonicSummary.parentNode.removeChild(tectonicSummary);
					nearbyCities = null;
					tectonicSummary = null;
				}
			});

		this._loadTextualContent(generalHeader, 'general-header', null);
		this._loadTextualContent(impactText, 'impact-text', 'Impact Text');
		this._loadTextualContent(generalText, 'general-text',
				'Additional Commentary');

		// Bind event listeners as needed

		Util.addEvent(mapContainer, 'click', (function (_this) {
			var callback = function callback () {
				_this._enhanceMap();
				Util.removeClass(nearbyCities.querySelector('ol'), 'staticmap');
				Util.removeEvent(mapContainer, 'click', callback);
			};
			return callback;
		})(this));
	};

	SummaryPage.prototype._getTextContentMarkup = function (type) {
		if (this._event.properties.products.hasOwnProperty(type)) {
			return '<div class="summary-' + type + '"></div>';
		}
		return '';
	};

	SummaryPage.prototype._getMapMarkup = function () {
		return '<div class="summary-map"></div>';
	};

	SummaryPage.prototype._loadStaticMapContent = function (container, cities) {
		var i = null,
		    len = null,
		    city = null,
		    latitude = this._event.geometry.coordinates[1],
		    longitude = this._event.geometry.coordinates[0],
		    points = [],
		    markup = null;

		markup = [
			'<img alt="Map" src="http://www.mapquestapi.com/staticmap/v4/getmap?' +
				'key=Fmjtd%7Cluub2h0rnh%2Cb2%3Do5-9ut0g6&' +
				'size=500,500&' +
				'type=map&' +
				'imagetype=jpeg&' +
				'pois='
		];

		for (i = 0, len = cities.length; i < len; i++) {
			city = cities[i];
			points.push('orange_1-' + (i+1) + ',' + city.latitude + ',' +
					city.longitude);
		}

		points.push('red_1,' + latitude + ',' + longitude);

		markup.push(points.join('|'));
		markup.push('"/>');

		container.innerHTML = markup.join('');
	};

	SummaryPage.prototype._getRelatedLinksMarkup = function () {
		var i = null,
		    len = null,
		    link = null,
		    cache = {},
		    links = this._event.properties.products['general-link'],
		    markup = ['<div class="summary-related-links"><h3>Related Links</h3><ul>'];

		if (links && links.length) {
			for (i = 0, len = links.length; i < len; i++) {
				link = links[i];

				if (!cache.hasOwnProperty(link.properties.url)) {
					markup.push('<li class="summary-related-link"><a href="' +
							link.properties.url + '">' + link.properties.text + '</a></li>');
					cache[link.properties.url] = true;
				}
			}

			markup.push('</ul></div>');
			return markup.join('');
		}
		return '';
	};

	SummaryPage.prototype._getAttributionMarkup = function () {
		var origin = this._event.properties.products.origin[0],
		    id = origin.id.split(':')[2],
		    locationId = id,
		    magnitudeId = id;

		if (origin.properties.hasOwnProperty('origin-source')) {
			locationId = origin.properties['origin-source'];
		}
		if (origin.properties.hasOwnProperty('magnitude-source')) {
			magnitudeId = origin.properties['magnitude-source'];
		}

		id = id.toUpperCase();
		locationId = locationId.toUpperCase();
		magnitudeId = magnitudeId.toUpperCase();

		if (locationId === magnitudeId) {
			return '<div class="summary-attribution">' +
				'Location and Magnitude contributed by: ' +
				Attribution.getMainContributerHeader(locationId) +
			'</div>';
		} else {
			return '<div class="summary-attribution">' +
				'Location contributed by: ' +
				Attribution.getMainContributerHeader(locationId) + '<br/>' +
				'Magnitude contributed by: ' +
				Attribution.getMainContributerHeader(magnitudeId) +
			'</div>';
		}
		return '';
	};

	SummaryPage.prototype._loadTextualContent = function (container, type, title) {

		var i = null,
		    len = null,
		    products = null,
		    markup = [];

		if (container === null ||
				!this._event.properties.products.hasOwnProperty(type)) {
			return;
		}

		products = this._event.properties.products[type];

		for (i = 0, len = products.length; i < len; i++) {
			markup.push('<div>' + products[0].contents[''].bytes + '<div>');
		}

		this._setTextContent(container, title, markup.join(''));
	};


	SummaryPage.prototype._setTextContent = function (container, title, markup) {
		var wrapper = document.createElement('div'),
		    header = document.createElement('h3');

		Util.addClass(container, 'accordion');
		Util.addClass(container, 'accordion-collapsed');

		if (title !== null && typeof title !== 'undefined' && title !== '') {
			header.innerHTML = title;
		} else {
			header.innerHTML = 'Section Header'; // TODO :: Hmm ... ?
		}

		wrapper.innerHTML = markup;

		container.appendChild(header);
		container.appendChild(wrapper);

		Util.addEvent(header, 'click', function () {
			if (Util.hasClass(container, 'accordion-collapsed')) {
				Util.removeClass(container, 'accordion-collapsed');
			} else {
				Util.addClass(container, 'accordion-collapsed');
			}
		});
	};

		SummaryPage.prototype._enhanceMap = function () {
		var _this = this;

		require(['summary/InteractiveMap'], function (InteractiveMap) {
			_this._interactiveMap = new InteractiveMap({
				el: _this._content.querySelector('.summary-map'),
				cities: _this._content.querySelector('.summary-nearby-cities'),
				eventDetails: _this._event
			});
		});
	};

	return SummaryPage;
});
