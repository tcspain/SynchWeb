/**
 * Fake Collection for data collection plans ordered by experiment order
 */

define([
	"backbone.paginator",
	"jquery.mockjax",
	
	"models/experimentplanfakes/samplecollectionplan",
	], function(
			PageableCollection,
			mockjax,
			SampleCollectionPlan
	) {
	var SCPlans = PageableCollection.extend({
		blSampleId: 0,
		model: SampleCollectionPlan,
		url: function() {
			return (this.blSampleId) ? "/dcplan/sample/" + this.blSampleId : "/dcplan";
		},
		
		state: {
			pageSize: 15,
		},
		
		initialize: function(models, options) {
			if (models && models.length > 0) this.models = models;
			if (options && options.sampleId) this.blSampleId = options.sampleId;
		},
	});
	
	mockjax({
		url: /^\/api\/dcplan\/sample\/([\d]*)$/,
		urlParams: ["sampleId"],
		response: function(settings) {
			if (settings.urlParams.sampleId === "398867") 
				this.responseText = [
					{
						DIFFRACTIONPLANID: "1",
						WAVELENGTH: "0.163",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "1",
					}, {
						DIFFRACTIONPLANID: "2",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "3",
					},
					];
			else if (settings.urlParams.sampleId === "398869")
				this.responseText = [
					{
						DIFFRACTIONPLANID: "2",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "2",
					}, {
						DIFFRACTIONPLANID: "3",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "4",
					},
					];
			else if (settings.urlParams.sampleId === "398865")
				this.responseText = [
					{
						DIFFRACTIONPLANID: "4",
						WAVELENGTH: "0.288",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "5",
					},
					];
			else
				this.responseText = [];
		},
	});
	
	return SCPlans;

});