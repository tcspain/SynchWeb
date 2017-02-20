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
        "modules/types/xpdf/samples/views/proteinlist",
        "modules/types/xpdf/samples/views/phaseadd",
        "modules/types/xpdf/samples/views/phaseview",
], function(GetView,
	SampleList, SampleView,
	GenSampleList, GenSampleView,

	ProteinList, ProteinView, AddProteinView,
	GenComponentList, GenComponentAdd, GenComponentView,
	XpdfSampleList, XpdfSampleView, XpdfPhaseList, XpdfPhaseAdd, XpdfPhaseView
	){


	return {

		SampleList: new GetView({
			views: {
                mx: SampleList,
 				saxs: SampleList,
              	gen: GenSampleList,
              	xpdf: XpdfSampleList,
			},
			default: GenSampleList,
		}),

		SampleView: new GetView({
        	views: {
                mx: SampleView,
        		saxs: SampleView,
                gen: GenSampleView,
                xpdf: XpdfSampleView,
        	},
        	default: GenSampleView,
        }),



		ProteinList: new GetView({
			views: {
                mx: ProteinList,
				saxs: ProteinList,
            	gen: GenComponentList,
            	xpdf: XpdfPhaseList,
            },
            default: GenComponentList,
        }),


        ProteinAdd: new GetView({
        	views: {
                mx: AddProteinView,
        		saxs: AddProteinView,
            	gen: GenComponentAdd,
            	xpdf: XpdfPhaseAdd,
        	},
        	default: GenComponentAdd
        }),


        ProteinView: new GetView({
        	views: {
                mx: ProteinView,
        		saxs: ProteinView,
                gen: GenComponentView,
                xpdf: XpdfPhaseView,
        	},
        	default: GenComponentView,
        })


	}


})