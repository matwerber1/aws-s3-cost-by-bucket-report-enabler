const aws = require('aws-sdk');
const s3 = new aws.S3();

/*
    Inspect each S3 bucket and check whether it has a tag named BucketName with
    a value equal to the bucket's name. If the tag is missing or has the wrong
    value add/edit the tag so its value equals the bucket name. 

    Once each S3 bucket is tagged, you can then add the 'BucketName' tag as a 
    cost tag in your cost and billing reports so that you have an easy way to
    see cost by bucket. 

    Note - this script does not currently handle listBucket responses that 
    require paging the results via a NextToken. 

    Note - this script could be further improved by converting it to a Lambda
    and using CloudWatch Events to trigger the Lambda on a periodic basis. 
*/
async function main() {
    
    var listBucketsResponse = await s3.listBuckets().promise();
    listBucketsResponse.Buckets.map(bucket => {
        checkBucketTags(bucket.Name);
    });
}


/* Check if bucket has the 'BucketName' tag and:
    - if BucketName is missing, add in a BucketName tag with value equal to bucket name
    - if BucketName tag present but has wrong value, update tag value to bucket name
    - if BucketName tag present and value matches bucket name, do nothing
*/
function checkBucketTags(bucket) {

    var tags = s3.getBucketTagging({ Bucket: bucket }, function (err, data) {
        if (err) {
            if (err.code === 'NoSuchTagSet') {
                console.log(`Bucket ${bucket} does not have any tags`);
                addTagToBucket(bucket, undefined, 'BucketName', bucket);
            }
            else {
                console.log(err, err.stack);
            }
        }
        else {
            var tagSet = data.TagSet;
            var bucketNameIndex = tagSet.findIndex(tags => tags.Key === 'BucketName');

            if (bucketNameIndex === undefined) {
                console.log(`Bucket ${bucket} does not have BucketName tag`);
                addTagToBucket(bucket, tagSet, 'BucketName', bucket);
            }
            else {
                var tag = tagSet[bucketNameIndex]

                // if tag BucketName exists but has wrong value, we must remove it from the old
                if (tag.Value !== bucket) {
                    console.log(`Bucket ${bucket} tagged with wrong BucketName tag value of "${tag.Value}"`);
                    // remove the old BucketName tag because it has the wrong value
                    var filteredTagSet = tagSet.filter(tag => tag.Key !== 'BucketName');
                    // add in the proper value
                    addTagToBucket(bucket, filteredTagSet, 'BucketName', bucket);
                }
                else {
                    console.log(`Bucket ${bucket} has proper BucketName tag`);
                }
            }
        }
    });
}

function addTagToBucket(bucket, oldTagSet, newKey, newValue) {

    var newTagSet = [];

    if (oldTagSet !== undefined) {
        newTagSet = oldTagSet;
    }

    var newTag = {
        Key: newKey,
        Value: newValue
    };

    newTagSet.push(newTag);

    var params = {
        Bucket: bucket, 
        Tagging: {
            TagSet: newTagSet
        }
    };

    s3.putBucketTagging(params, function(err, data) {
        if (err) console.log(`Failed to tag ${bucket}:`, err, err.stack);
        else     console.log(`Added BucketName tag to ${bucket}`);
    });
}

(async () => {
    try {
        await main();
    }
    catch (e) {
        console.log("Unhandled error: " + e);
    }
})();
