/* global define, describe, it, beforeEach, afterEach */
define([
	'chai',
	'sinon',
	'./nc72119970',

	'impact/ShakeMapPage',
	'impact/ImpactModule',
	'./stationlist',

	'util/Xhr'
], function (
	chai,
	sinon,
	nc72119970,

	ShakeMapPage,
	ImpactModule,
	stationlist,

	Xhr
) {

	'use strict';

	var expect = chai.expect;

	var eventDetails = {
		properties: {
			products: {
				shakemap: [{
					code: 'usc000myqq',
					contents: {
						'download/intensity.jpg': {url: 'intensity.jpg'},
						'download/pga.jpg': {url: 'pga.jpg'},
						'download/pgv.jpg': {url: 'pgv.jpg'},
						'download/psa03.jpg': {url: 'psa03.jpg'},
						'download/psa10.jpg': {url: 'psa10.jpg'},
						'download/psa30.jpg': {url: 'psa30.jpg'},
						'download/sd.jpg': {url: 'sd.jpg'},
						'download/stationlist.xml': {url:'stationlist.xml'},
					}
				}]
			}
		}
	};

	var getClickEvent = function () {
		var clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent('click', true, true, window, 1, 0, 0);
		return clickEvent;
	};

	describe('ShakeMapPageTest test suite.', function () {

		describe('Constructor', function () {
			it('Can be defined.', function () {
				/* jshint -W030 */
				expect(ShakeMapPage).not.to.be.undefined;
				/* jshint +W030 */
			});

			it('Can be instantiated', function () {
				var page = new ShakeMapPage({
						'eventDetails': eventDetails,
						'productTypes': ['shakemap']
					});

				expect(page).to.be.an.instanceof(ShakeMapPage);
			});
		});

		describe('Tabbed Content', function () {
			it('contains all images and station list', function () {
				var page = new ShakeMapPage({ 'eventDetails': eventDetails }),
				    tablistPanels = page.getContent().
								querySelectorAll('.tablist-panel');

				expect(tablistPanels.length).to.be.equal(8);
			});
		});

		describe('Station List Content', function () {
			var eventDetails = {
				properties: {
					products: {
						shakemap: [{
							code: 'ak11171372',
							contents: {
								'download/stationlist.xml': {
									url:'stationlist.xml'
								}
							}
						}]
					}
				}
			},
			    page, content, ajaxStub, stations, container, detailsClickSpy;

			beforeEach(function () {

				var parser = new DOMParser();
				var doc = parser.parseFromString(stationlist.xml, 'application/xml');

				detailsClickSpy = sinon.spy(ShakeMapPage.prototype,
						'_toggleDetails');

				ajaxStub = sinon.stub(Xhr, 'ajax', function (options) {
					if (options.success) {
						options.success({}, {responseXML: doc});
					}
				});

				page = new ShakeMapPage({
					'eventDetails': eventDetails
				});
				content = page.getContent();
				container = content.querySelector('.stations');
				stations = content.querySelectorAll('.station-toggle');
			});

			afterEach(function () {
				ajaxStub.restore();
				ajaxStub = null;
				detailsClickSpy.restore();
			});

			// check all stations are present
			it('has all stations', function () {
				expect(stations.length).to.be.equal(2);
			});

			// check summary details
			it('has summary details', function () {
				var stationDetails = stations[0].querySelectorAll('li');
				expect(stationDetails.length).to.be.equal(4);
			});

			// check summary mmi details
			it('has summary details for a station', function () {
				var station = stations[0],
				    mmi = station.querySelector('.mmi');
				/* jshint -W030 */
				expect(mmi.classList.contains('mmiII')).to.be.true;
				/* jshint +W030 */
			});

			// check detail information
			it('has station details', function () {
				var station = stations[0],
				    target = station.querySelector('a'),
				    stationDetails, components, content;

				page._toggleDetails({'target': target});

				content = page.getContent();
				stationDetails = content.querySelector('.station-details');
				components = content.querySelector('.station-components');

				expect(stationDetails.querySelector('dd').innerHTML).to.equal('UNK');
				expect(components.querySelectorAll('tbody>tr').length).to.equal(9);
			});

			//check click event on show details
			it('toggles details on click', function () {
				container.dispatchEvent(getClickEvent());
				expect(detailsClickSpy.callCount).to.equal(1);
			});

		});

		describe('Summary section details', function () {
			var expect = chai.expect,
			    options = {
						eventDetails: nc72119970,
						module: new ImpactModule(),
						productTypes: ['shakemap'],
						title: 'shakemap',
						hash: 'shakemap'
					},
			    page = new ShakeMapPage(options);

			it('Get summary info', function () {
				var content = page.getContent(),
				    shakemap = content.querySelectorAll('.shakemap');

				/* jshint -W030 */
				expect(shakemap.length).to.not.equal(0);
				/* jshint +W030 */
			});

			it('Can get product details', function () {
				var content = page.getContent();

				expect(content).to.be.a('object');
			});
		});
	});
});