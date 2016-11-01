define(['views/getview',
		'modules/samples/views/list',
        'modules/samples/views/view',
    
        'modules/types/gen/samples/views/list',
        'modules/types/gen/samples/views/view',

        'modules/samples/views/proteinlist',
        'modules/samples/views/proteinview',
        'modules/samples/views/proteinadd',

        'modules/types/gen/samples/views/componentlist',
        'modules/types/gen/samples/views/componentadd',
        'modules/types/gen/samples/views/componentview',
        
        "modules/types/xpdf/samples/views/samplelist",
        "modules/types/xpdf/samples/views/view",
        "modules/types/xpdf/samples/views/phaseview",
], function(GetView,
	SampleList, SampleView,
	GenSampleList, GenSampleView,

	ProteinList, ProteinView, AddProteinView,
	GenComponentList, GenComponentAdd, GenComponentView,
	XpdfSampleList, XpdfSampleView, XpdfPhaseView
	){


	return {

		SampleList: new GetView({
			views: {
 				mx: SampleList,
              	gen: GenSampleList,
              	xpdf: XpdfSampleList,
			},
			default: GenSampleList,
		}),

		SampleView: new GetView({
        	views: {
        		mx: SampleView,
                gen: GenSampleView,
                xpdf: XpdfSampleView,
        	},
        	default: GenSampleView,
        }),



		ProteinList: new GetView({
			views: {
				mx: ProteinList,
            	gen: GenComponentList,
            },
            default: GenComponentList,
        }),


        ProteinAdd: new GetView({
        	views: {
        		mx: AddProteinView,
            	gen: GenComponentAdd,
        	},
        	default: GenComponentAdd
        }),


        ProteinView: new GetView({
        	views: {
        		mx: ProteinView,
                gen: GenComponentView,
                xpdf: XpdfPhaseView,
        	},
        	default: GenComponentView,
        })


	}


})