const axios = require("axios");
const ACCESS_TOKEN = process.env.OBJECT_ACCESS_TOKEN
const headers = {
   'Authorization': `Bearer ${ACCESS_TOKEN}`,
   'Content-Type': 'application/json'
}
exports.main = async (context, sendResponse) => {
   
//    console.log("file ", process.env.LIST_ACCESS_TOKEN)
   
   
   function endOfMonth(date) {
	  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
   }   
   const body = context.body;
   const filterGroups = [];
   let query_parameters = [];
   const date = body.date;
   var d = new Date(parseInt(date));
   let currentMonth = parseInt(d.getMonth()) + 1
   let currentYear = parseInt(d.getFullYear())
   let currentMonthString = '-0' + currentMonth  + '-';
   let after = 0;

   const filter = body.filter;
   const type = body.type;
   let search = body.search || "";
   let eDate = new Date( parseInt(body.date))
   let sDateValue =  d.valueOf()
   let eMonth = endOfMonth(eDate);
   let eMonthDate = eMonth.valueOf();
   let arrfilter;
   let arrType;




   if(body.search == "All" ){
	  search = "";
   } else {
	  search = body.search;
   }
   if(body.filter == "All" ){
	  arrfilter = [];
	  arrfilter = "All";
   } else {
	  arrfilter = filter.split(",")
   }
   if(body.type == "All" ){
	  arrType = [];
	  arrType = "All";
   } else {
	  arrType = type.split(",")
   }
   console.log("be MonthDate ")
    console.log("eMonthDate ", eMonthDate)


   query_parameters.push( { "propertyName": "start_date", "operator": "LTE", "value": eMonthDate }) ;

   if((filter == "All") && (type == "All") && (search == "All")){
   } else {
	  query_parameters.push( { "propertyName": "filter_group", "operator": "IN", "values": arrfilter } ) ;
	  query_parameters.push( { "propertyName": "filter_type", "operator": "IN", "values": arrType } ) ;
   }
   const newArr1 = query_parameters.filter(object => {
	  return object.values !== 'All';
   });
 
   filterGroups.push({ "filters" : newArr1 });


   const limit = 100;
   const properties = [ 
	  "event_title",
	  "button_text",
	  "description_long",
	  "description_short",
	  "end_date",
	  "event_organiser",
	  "featured_image",
	  "featured_image_v1",
	  "fees",
	  "filter",
	  "filters",
	  "hubspot_team_id",
	  "hubspot_owner_id",
	  "hubspot_owner_assigneddate",
	  "event_meta",
	  "event_path",
	  "pillar",
	  "published",
	  "record_owner",
	  "redirect_to_website",
	  "registration_url",
	  "registration_cta",
	  "scheduled_publish_date",
	  "scheduled_unpublish_date",
	  "sport_tags",
	  "start_date",
	  "studio",
	  "thumbnail_image",
	  "thumbnail",
	  "tags",
	  "time",
	  "type", 
	  "venue",
	  "filter_type",
	  "filter_group",
	  "start_time",
	  "end_time"
   ];
   let nextPageNumber = 0;
   let DataList = [];

   //  =============== Administrator List ====================   

   console.log("axios1 ", JSON.stringify(axios))
   
   
   let apiResponse = await axios.post("https://api.hubapi.com/crm/v3/objects/2-5831481/search", {
	  "query": search,
	  "filterGroups": filterGroups,
	  "after": after,
	  "sorts": [
		 {
			"propertyName": "start_date",
			"direction": "ASCENDING"
		 }
	  ],
	  "properties": properties,
	  "limit": limit
   }, { headers });

   let results = await apiResponse;
   let data = results.data;
   DataList = [...DataList, ...data.results];

   let loopCount = parseInt(data.total);
   console.log("loopCount ", loopCount )
   if (loopCount <= 100) {
	  dataFilter();
   } else {
       
	  nextPageNumber = parseInt(data.paging.next.after);
	  let nuOF = (loopCount / limit) -1 ;
	  
	  if ((loopCount % limit) >= 1) {
		 nuOF = Math.ceil(nuOF + 1);
	  }
	  console.log("nuOF1 ", nuOF)
	  for (let i = 1; i <= nuOF; i++) {
		 //             console.log("i= ", i);
		 console.log("nextPageNumber ", (nextPageNumber * i))
		 await getAll((nextPageNumber * i));

	  }
   }
   console.log("list", DataList.length);
   dataFilter();

   async function getAll(nextPage) {
	  try {


		 let apiResponse2 = await axios.post("https://api.hubapi.com/crm/v3/objects/2-5831481/search", {
			"query": search,
			"filterGroups": filterGroups,
			"after": nextPage,
			"sorts": [
			   {
				  "propertyName": "start_date",
				  "direction": "ASCENDING"
			   }
			],
			"properties": properties,
			"limit": limit
		 }, { headers });

		 let results = await apiResponse2;

		 DataList = [...DataList, ...results.data.results];
		 console.log("update length ", DataList.length);
		 // if (response.data.paging.next.after) {
		 //     let nextPageComing = response.data.paging.next.after;
		 //     console.log("nexpage ", nextPageComing);
		 // } else {
		 //     console.log("Call filter two");
		 //     dataFilter();
		 // }
	  } catch (error) {
		 console.log("error", error);
	  }
   }

   console.log("currentYear ", currentYear)
   function dataFilter(){
	  console.log("total Data", DataList.length)
	  console.log("last data", DataList[DataList.length - 1].properties.event_title)
	  try{
		 let resultArray = [];
		 const newData = DataList.filter((ele) => {
			let sDatePro = new Date(ele.properties.start_date)
			let eDatePro = new Date(ele.properties.end_date)
			let sMonth = sDatePro.getMonth() + 1;
			let eMonth = eDatePro.getMonth() + 1;
			let sYear = sDatePro.getFullYear();
			let eYear = eDatePro.getFullYear();

			if(sYear <= currentYear && ele.properties.published == "true" ) {
			   if(eYear > currentYear && ele.properties.published == "true" ){
				  resultArray.push(ele)
			   } else if( eYear == currentYear && eMonth >= currentMonth && ele.properties.published == "true" ) {
				  resultArray.push(ele)
			   }
			} else if(currentMonth >= sMonth  && eMonth >= currentMonth && sYear <= currentYear && eYear >= currentYear && ele.properties.published == "true" )  {
			   resultArray.push(ele)
			}


			// 			   return ele
			//                 return (currentMonth >= sMonth  && eMonth >= currentMonth && sYear <= currentYear && eYear >= currentYear && ele.properties.published == "true" )
		 })

		 sendResponse({ body: resultArray , statusCode: 200 });
	  }catch(e){
		 console.log("e= ", e.message)
	  }
   }
}   

