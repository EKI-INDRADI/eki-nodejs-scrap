// Maintainer : Eki

// READ ME  : 
// function ini digunakan untuk melihat detail error try_catch (seperti tanpa try catch)
// tanpa inject depedency

exports.try_catch_error_detail = async function (error) {
    if (typeof error === 'object') {
  
      console.log('\n====== functions -> tools -> try_catch_error_detail.js (MESSAGE ONLY) ======')
      if (error.message) {
        console.log('\nMessage: ' + error.message);
      }
      if (error.stack) {
        console.log('\nTRY-CATCH-ERROR-DETAIL :');
        console.log('====================');
        console.log(error.stack);
      }
      console.log('\n============================================================================')
    } else {
      console.log('TRY-CATCH-ERROR-DETAIL :: argument is not an object');
    }
  };
  
  
  
  // - EXAMPLE CODE : 
  
  // const error_detail =  require('../../functions/tools/try_catch_error_detail')
  
  // try {
  //   data.error;
  // } catch (error) {
  //   console.log("function stock_mutation.js, createStockMutationTransactionTimeToolsDeliveryOrder, reduce_cart, null repair, error : " + error.message);
  //   error_detail.try_catch_error_detail(error);
  //   res_json = {
  //     statusCode: 0,
  //     message: "function stock_mutation.js, createStockMutationTransactionTimeToolsDeliveryOrder, reduce_cart, null repair, error : " + error.message
  //   };
  //   return res_json;
  // }