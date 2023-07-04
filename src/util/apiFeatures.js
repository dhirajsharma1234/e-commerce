class ApiFeatures {

    constructor(query,queryStr) {
        this.query = query;
        this.queryStr = queryStr;       
    }

    search() {
        const search = this.queryStr.search ? { 
            name: {
                $regex: this.queryStr.search,
                $options:"i"
            } 
        }:{};

        this.query = this.query.find({...search});


        return this;
    }

    filter() {
        const queryCopy = {...this.queryStr};
    
        const removeFields = ["search","page","limit"];

        removeFields.forEach(val => delete queryCopy[val]);
        
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/g,key => `$${key}`);
        console.log(queryStr);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    paginate(resultPerPage) {
        const page = this.queryStr.page || 1;

        const skip = resultPerPage * (page - 1);

        //this.query --> Product.findOne
        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }

}

export { ApiFeatures };