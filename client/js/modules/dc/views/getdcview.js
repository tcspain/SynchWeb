define(['views/getview',
	'modules/dc/datacollections',
    'modules/types/gen/dc/datacollections',
    'modules/types/tomo/dc/datacollections',
    'modules/types/em/dc/datacollections',
    'modules/types/pow/dc/datacollections',
<<<<<<< Upstream, based on upstream/master
    'modules/types/saxs/dc/datacollections',
=======
    "modules/types/xpdf/dc/datacollections",
>>>>>>> 3251065 Add a 'new sample' button to XPDF data collection list page.
    
], function(GetView,
	DCList,
<<<<<<< Upstream, based on upstream/master
	GenericDCList, TomoDCList, EMDCList, POWDCList, SAXSDCList
=======
	GenericDCList, TomoDCList, EMDCList, POWDCList,
	XpdfDCList
>>>>>>> 3251065 Add a 'new sample' button to XPDF data collection list page.
	){


	return {

        DCView: new GetView({
        	views: {
                mx: DCList,
                sm: DCList,
                gen: GenericDCList,
                tomo: TomoDCList,
                em: EMDCList,
                pow: POWDCList,
<<<<<<< Upstream, based on upstream/master
                saxs: SAXSDCList,
=======
                xpdf: XpdfDCList,
>>>>>>> 3251065 Add a 'new sample' button to XPDF data collection list page.
            },
        	default: GenericDCList,
        })


	}


})