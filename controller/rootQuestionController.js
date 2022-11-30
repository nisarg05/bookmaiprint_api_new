const questionModel = require('../model/question');
const answerModel = require('../model/answer');

async function rootDetails(leafId,rootList){
    let parents = await questionModel.findById(leafId)
   // console.log('parents:',rootList)
    if(parents!=null && parents!='' && parents){
        rootList.push(parents.question);
       // console.log('parents.answer_id',parents.answer_id)
        if(parents.answer_id!=null && parents.answer_id!=''){
            await rootDetails(parents.answer_id,rootList)
        }else{
            console.log(rootList,"rootList")
            return rootList.reverse();
        } 
    }else{
        let parentAns = await answerModel.findById(leafId)
        rootList.push(parentAns.option);
        await rootDetails(parentAns.question_id,rootList)
    }

    return rootList;
}

module.exports.rootDetails = rootDetails;
