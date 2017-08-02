/*
 * Tests for the XPDF phase compositor
 */

define([
        "marionette",
        "backbone.paginator",
        "models/sample",
        "models/protein",
        "collections/proteins",
        "utils/table",
        "views/table",
        "modules/types/xpdf/utils/phasecompositor"
        ], function(
        		Marionette,
        		PageableCollection,
        		Sample,
        		Phase,
        		Phases,
        		table,
        		TableView,
        		phaseCompositor
        ) {
	var CompoCell = table.TemplateCell.extend({
		getTemplate: function() {
			var phases = this.model.get("components");
			var fractions = phases.pluck("ABUNDANCE"); // Phases here have an additional abundance attribute
			var compositionString = phaseCompositor.composeComposition(phases, fractions, true);

			return "<div class=\"composition\">"+compositionString+"</div>";
		},
	});
	
	return TableView.extend( {
		
		initialize: function(options) {
			
			options.collection = this.createData();
			
			this.columns = [
			                { name: "NAME", label: "Name", cell: "string", editable: false},
			                { name: "COMPOSITION", label: "Composition", cell: CompoCell, editable: false},
			];
			
			TableView.prototype.initialize.apply(this, [options]);

		},
		
		createData: function() {
			
			var Samples = PageableCollection.extend({
				model: Sample,
		        state: {
		            pageSize: 15,
		        },

			});
			var samples = new Samples();
			
			var sample;
			var phases, phase;
			var iPhase, iSample = 1;
			// Iron
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "Fe", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;
			
			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "Fe",
						"components" : phases
						});
			samples.add(sample);
			iSample++;
			
			// water
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "H2O", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;
			
			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "H₂O",
						"components" : phases
						});
			samples.add(sample);
			iSample++;
			
			// cysteine
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "HO2CCHNH2CH2SH", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;
			
			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "C₃H₇NO₂S",
						"components" : phases
						});
			samples.add(sample);
			iSample++;
			
			// BTO
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "BaTiO3", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;
			
			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "BaO₃Ti",
						"components" : phases
						});
			samples.add(sample);
			iSample++;
			
			// Lead-tin
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "Pb", "ABUNDANCE": 0.5});
			phases.add(phase);
			iPhase++;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "Sn", "ABUNDANCE": 0.5});
			phases.add(phase);
			iPhase++;

			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "Pb₀.₅Sn₀.₅",
						"components" : phases
						});
			samples.add(sample);
			iSample++;

			// lysine: bracket test
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "HO2CCH(NH2)((CH2)4NH2)", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;

			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "C₆H₁₄N₂O₂",
						"components" : phases
						});
			samples.add(sample);
			iSample++;

			// ATP: bracket test
			sample = new Sample();
			phases = new Phases();
			iPhase = 1;
			
			phase = new Phase();
			phase.set({"PROTEINID": iPhase, "SEQUENCE": "HO(P(O)2OH)3(CH2C4H4(OH)2O)(CHN2C2N2CHC)(NH2)", "ABUNDANCE": 1.0});
			phases.add(phase);
			iPhase++;

			sample.set({"BLSAMPLEID" : iSample,
						"NAME" : "C₁₀H₁₆N₅O₁₃P₃",
						"components" : phases
						});
			samples.add(sample);
			iSample++;
	
			
			
			return samples;
			
		},
		
	});
});