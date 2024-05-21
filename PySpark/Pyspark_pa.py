import os
import pyspark.sql.functions as F
import pyspark.sql.types as T
from utilities import SEED
# availiable on AWS EMR
import numpy as np
from pyspark.sql.window import Window
from pyspark.sql.types import FloatType

from pyspark.sql import SparkSession, DataFrame
from pyspark.ml.feature import Word2VecModel
from pyspark.ml.regression import DecisionTreeRegressor

from pyspark.ml.stat import Summarizer


# ---------------- choose input format, dataframe or rdd ----------------------
INPUT_FORMAT = 'dataframe'  # change to 'rdd' if you wish to use rdd inputs
# -----------------------------------------------------------------------------
if INPUT_FORMAT == 'dataframe':
    import pyspark.ml as M
    import pyspark.sql.functions as F
    import pyspark.sql.types as T
    from pyspark.ml.regression import DecisionTreeRegressor
    from pyspark.ml.evaluation import RegressionEvaluator
if INPUT_FORMAT == 'koalas':
    import databricks.koalas as ks
elif INPUT_FORMAT == 'rdd':
    import pyspark.mllib as M
    from pyspark.mllib.feature import Word2Vec
    from pyspark.mllib.linalg import Vectors
    from pyspark.mllib.linalg.distributed import RowMatrix
    from pyspark.mllib.tree import DecisionTree
    from pyspark.mllib.regression import LabeledPoint
    from pyspark.mllib.linalg import DenseVector
    from pyspark.mllib.evaluation import RegressionMetrics


# ---------- Begin definition of helper functions, if you need any ------------

# def task_1_helper():
#   pass

# -----------------------------------------------------------------------------


def task_1(data_io, review_data, product_data):
    # -----------------------------Column names--------------------------------
    # Inputs:
    asin_column = 'asin'
    overall_column = 'overall'
    # Outputs:
    mean_rating_column = 'meanRating'
    count_rating_column = 'countRating'
    # -------------------------------------------------------------------------

    # ---------------------- Your implementation begins------------------------
    
    #Merge
    rd = review_data.select(asin_column, overall_column).toDF(asin_column, overall_column)
    pd = product_data.withColumnRenamed(asin_column,"pasin").select("pasin").toDF('pasin')
    merged = pd.join(rd, pd.pasin ==  rd.asin,"leftouter")

    #Calculate average and count of ratings/product
    p = merged[['pasin', overall_column]].groupBy("pasin").agg(\
         F.avg(overall_column).alias(mean_rating_column),\
         F.count(overall_column).alias(count_rating_column)
     )
    mc = p.filter(p.countRating > 0)

    #Extract some statistics out of the generated columns
    '''
    res
    | -- count_total: int -- count of rows of the transformed table, including null rows
    | -- mean_meanRating: float -- mean value of meanRating
    | -- variance_meanRating: float -- variance of ...
    | -- numNulls_meanRating: int -- count of nulls of ...
    | -- mean_countRating: float -- mean value of countRating
    | -- variance_countRating: float -- variance of ...
    | -- numNulls_countRating: int -- count of nulls of ...
    '''
    count_total = p.count()

    mean_meanRating = p.select(F.avg(F.col(mean_rating_column))).head()[0]
    variance_meanRating = p.select(F.variance(F.col(mean_rating_column))).head()[0]
    #nullMR = p.where(F.col('meanRating').isNull())
    numNulls_meanRating = p.where(F.col(mean_rating_column).isNull()).count()

    mean_countRating = mc.select(F.avg(F.col(count_rating_column))).head()[0]
    variance_countRating = mc.select(F.variance(F.col(count_rating_column))).head()[0]
    #nullCR = p.where(F.col('countRating').isNull())
    numNulls_countRating = p.filter(F.col(count_rating_column) < 1).count()




    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    # Calculate the values programmaticly. Do not change the keys and do not
    # hard-code values in the dict. Your submission will be evaluated with
    # different inputs.
    # Modify the values of the following dictionary accordingly.
    res = {
        'count_total': None,
        'mean_meanRating': None,
        'variance_meanRating': None,
        'numNulls_meanRating': None,
        'mean_countRating': None,
        'variance_countRating': None,
        'numNulls_countRating': None
    }
    # Modify res:
    res['count_total'] = count_total
    res['mean_meanRating'] = mean_meanRating
    res['variance_meanRating'] = variance_meanRating
    res['numNulls_meanRating'] = numNulls_meanRating
    
    res['mean_countRating'] = mean_countRating
    res['variance_countRating'] = variance_countRating
    res['numNulls_countRating'] = numNulls_countRating


    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_1')
    return res
    # -------------------------------------------------------------------------


def task_2(data_io, product_data):
    # -----------------------------Column names--------------------------------
    # Inputs:
    salesRank_column = 'salesRank'
    categories_column = 'categories'
    asin_column = 'asin'
    # Outputs:
    category_column = 'category'
    bestSalesCategory_column = 'bestSalesCategory'
    bestSalesRank_column = 'bestSalesRank'
    # -------------------------------------------------------------------------

    # ---------------------- Your implementation begins------------------------
    p = product_data.withColumn(category_column,
                                F.flatten(F.col(categories_column))
                                .getItem(0)
                                )
                                .withColumn(bestSalesCategory_column, F.map_keys(F.col(salesRank_column)).getItem(0))
                                .withColumn(bestSalesRank_column, F.map_values(F.col(salesRank_column)).getItem(0))
                                .drop(salesRank_column, categories_column)
    
    count_total = p.count()
    mean_bestSalesRank = p.select(F.avg(F.col(bestSalesRank_column))).head()[0]
    variance_bestSalesRank = p.select(F.variance(F.col(bestSalesRank_column))).head()[0]
    
    nullC = p.filter(F.col(category_column).isNull()).count()
    blankC = p.filter(F.col(category_column) == "").count()
    numNulls_category = nullC + blankC
    
    countDistinct_category = p.select(F.countDistinct(F.col(category_column))).head()[0] - 1 #Remove "unique" value of null
    
    nullS = p.filter(F.col(bestSalesCategory_column).isNull()).count()
    blankS = p.filter(F.col(bestSalesCategory_column) == "").count()
    numNulls_bestSalesCategory = nullS + blankS
    
    numNulls_bestSalesCategory = p.filter(F.col(bestSalesCategory_column).isNull()).count()
    
    
    countDistinct_bestSalesCategory = p.select(F.countDistinct(F.col(bestSalesCategory_column))).head()[0]




    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    res = {
        'count_total': None,
        'mean_bestSalesRank': None,
        'variance_bestSalesRank': None,
        'numNulls_category': None,
        'countDistinct_category': None,
        'numNulls_bestSalesCategory': None,
        'countDistinct_bestSalesCategory': None
    }
    # Modify res:
    res['count_total'] = count_total
    res['mean_bestSalesRank'] = mean_bestSalesRank
    res['variance_bestSalesRank'] = variance_bestSalesRank
    res['numNulls_category'] = numNulls_category
    res['countDistinct_category'] = countDistinct_category
    res['numNulls_bestSalesCategory'] = numNulls_bestSalesCategory
    res['countDistinct_bestSalesCategory'] = countDistinct_bestSalesCategory



    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_2')
    return res
    # -------------------------------------------------------------------------


def task_3(data_io, product_data):
    # -----------------------------Column names--------------------------------
    # Inputs:
    asin_column = 'asin'
    price_column = 'price'
    attribute = 'also_viewed'
    related_column = 'related'
    # Outputs:
    meanPriceAlsoViewed_column = 'meanPriceAlsoViewed'
    countAlsoViewed_column = 'countAlsoViewed'
    # -------------------------------------------------------------------------

    # ---------------------- Your implementation begins------------------------
    p = product_data #rename for convenience
    prices = p.select(asin_column, price_column).toDF("price_asin", "price").na.drop("any")
    p2 = p.select(p.asin, p.related).toDF("pasin", related_column).withColumn(related_column, F.explode(F.col(related_column).getItem(attribute)))
    p2 = p2.join(prices, p2.related ==  prices.price_asin,"left").drop('related', 'price_asin').groupby('pasin').agg(F.avg(price_column).alias(meanPriceAlsoViewed_column))
    
    p = p.select(asin_column).toDF(asin_column)
    p = p.join(p2, p.asin == p2.pasin, "left").select(asin_column, meanPriceAlsoViewed_column).toDF(asin_column, meanPriceAlsoViewed_column)
    
    p3 = product_data.withColumn(countAlsoViewed_column,
                     F.when(F.col(related_column + "." + attribute).isNull(), None)
                         .otherwise(F.size(F.col(related_column + "." + attribute)))
                    )

    count_tot = p.count()
    mean_pav = p.agg(F.avg(F.col(meanPriceAlsoViewed_column))).head()[0]
    var_pav = p.agg(F.variance(F.col(meanPriceAlsoViewed_column))).head()[0]
    null_pav = p.filter(F.col(meanPriceAlsoViewed_column).isNull()).count()

    mean_cav = p3.agg(F.avg(F.col(countAlsoViewed_column))).head()[0]
    var_cav = p3.agg(F.variance(F.col(countAlsoViewed_column))).head()[0]
    null_cav = p3.filter(F.col(countAlsoViewed_column).isNull()).count()



    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    res = {
        'count_total': None,
        'mean_meanPriceAlsoViewed': None,
        'variance_meanPriceAlsoViewed': None,
        'numNulls_meanPriceAlsoViewed': None,
        'mean_countAlsoViewed': None,
        'variance_countAlsoViewed': None,
        'numNulls_countAlsoViewed': None
    }
    # Modify res:
    res['count_total'] = count_tot
    res['mean_meanPriceAlsoViewed'] = mean_pav
    res['variance_meanPriceAlsoViewed'] = var_pav
    res['numNulls_meanPriceAlsoViewed'] = null_pav
    res['mean_countAlsoViewed'] = mean_cav
    res['variance_countAlsoViewed'] = var_cav
    res['numNulls_countAlsoViewed'] = null_cav



    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_3')
    return res
    # -------------------------------------------------------------------------


def task_4(data_io, product_data):
    # -----------------------------Column names--------------------------------
    # Inputs:
    price_column = 'price'
    title_column = 'title'
    # Outputs:
    meanImputedPrice_column = 'meanImputedPrice'
    medianImputedPrice_column = 'medianImputedPrice'
    unknownImputedTitle_column = 'unknownImputedTitle'
    # -------------------------------------------------------------------------

    # ---------------------- Your implementation begins------------------------
    p = product_data
    mip = p.select(F.avg(F.col(price_column))).head()[0]
    p = p.withColumn(meanImputedPrice_column, F.when(F.col(price_column).isNull(), mip).otherwise(F.col(price_column).cast(FloatType())))
    
    mmip = p.stat.approxQuantile(price_column, [0.5], 0.001)[0]
    p = p.withColumn(medianImputedPrice_column, F.when(F.col(price_column).isNull(), mmip).otherwise(F.col(price_column).cast(FloatType())))
    
    p = p.withColumn(unknownImputedTitle_column, F.when(F.col(title_column).isNull(), "unknown").when(F.col(title_column) == "", "unknown"))

    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    res = {
        'count_total': None,
        'mean_meanImputedPrice': None,
        'variance_meanImputedPrice': None,
        'numNulls_meanImputedPrice': None,
        'mean_medianImputedPrice': None,
        'variance_medianImputedPrice': None,
        'numNulls_medianImputedPrice': None,
        'numUnknowns_unknownImputedTitle': None
    }
    # Modify res:
    res['count_total'] = p.count()
    
    res['mean_meanImputedPrice'] = p.agg(F.avg(F.col(meanImputedPrice_column))).head()[0]
    res['variance_meanImputedPrice'] = p.agg(F.variance(F.col(meanImputedPrice_column))).head()[0]
    res['numNulls_meanImputedPrice'] = p.filter(F.col(meanImputedPrice_column).isNull()).count()
    
    res['mean_medianImputedPrice'] = p.agg(F.avg(F.col(medianImputedPrice_column))).head()[0]
    res['variance_medianImputedPrice'] = p.agg(F.variance(F.col(medianImputedPrice_column))).head()[0]
    res['numNulls_medianImputedPrice'] = p.filter(F.col(medianImputedPrice_column).isNull()).count()
    
    res['numUnknowns_unknownImputedTitle'] = p.agg(F.count(F.col(unknownImputedTitle_column))).head()[0]


    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_4')
    return res
    # -------------------------------------------------------------------------


def task_5(data_io, product_processed_data, word_0, word_1, word_2):
    # -----------------------------Column names--------------------------------
    # Inputs:
    title_column = 'title'
    # Outputs:
    titleArray_column = 'titleArray'
    titleVector_column = 'titleVector'
    # -------------------------------------------------------------------------

    # ---------------------- Your implementation begins------------------------
    product_processed_data_output = product_processed_data.withColumn(titleArray_column, F.split(F.lower(F.col(title_column)), ' '))
    SEED = 102
    
    w2v = M.feature.Word2Vec(vectorSize=16, minCount=100, numPartitions=4, seed=SEED, inputCol=titleArray_column, outputCol=titleVector_column)
    t = product_processed_data_output.select(F.col(titleArray_column)).toDF(titleArray_column)
    model = w2v.fit(t.dropna())



    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    res = {
        'count_total': None,
        'size_vocabulary': None,
        'word_0_synonyms': [(None, None), ],
        'word_1_synonyms': [(None, None), ],
        'word_2_synonyms': [(None, None), ]
    }
    # Modify res:
    res['count_total'] = product_processed_data_output.count()
    res['size_vocabulary'] = model.getVectors().count()
    for name, word in zip(
        ['word_0_synonyms', 'word_1_synonyms', 'word_2_synonyms'],
        [word_0, word_1, word_2]
    ):
        res[name] = model.findSynonymsArray(word, 10)


    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_5')
    return res
    # -------------------------------------------------------------------------


def task_6(data_io, product_processed_data):
    # -----------------------------Column names--------------------------------
    # Inputs:
    category_column = 'category'
    # Outputs:
    categoryIndex_column = 'categoryIndex'
    categoryOneHot_column = 'categoryOneHot'
    categoryPCA_column = 'categoryPCA'
    # -------------------------------------------------------------------------    

    # ---------------------- Your implementation begins------------------------
    p = product_processed_data
    category = p.select(F.col(category_column)).toDF(category_column)
    
    stringIndexer = M.feature.StringIndexer(inputCol=category_column, outputCol=categoryIndex_column) #Index
    SI = stringIndexer.fit(category) #Create Indexer object and fit to DF
    SId = SI.transform(category) #Transform using Indexer object
    
    oneHot = M.feature.OneHotEncoder(inputCol=categoryIndex_column, outputCol=categoryOneHot_column, dropLast = False)
    OH = oneHot.fit(SId)
    OHd = OH.transform(SId)
    
    pca = M.feature.PCA(k=15, inputCol=categoryOneHot_column, outputCol=categoryPCA_column)
    PCA = pca.fit(OHd)
    PCAd = PCA.transform(OHd)


    # -------------------------------------------------------------------------

    # ---------------------- Put results in res dict --------------------------
    res = {
        'count_total': None,
        'meanVector_categoryOneHot': [None, ],
        'meanVector_categoryPCA': [None, ]
    }
                                 
    res['count_total'] = PCAd.count()
    res['meanVector_categoryOneHot'] = PCAd.select(Summarizer.mean(F.col(categoryOneHot_column))).head()[0]
    res['meanVector_categoryPCA'] = PCAd.select(Summarizer.mean(F.col(categoryPCA_column))).head()[0]
                                 
                                 
    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_6')
    return res
    # -------------------------------------------------------------------------
    
    
def task_7(data_io, train_data, test_data):
    
    # ---------------------- Your implementation begins------------------------
    #Need labels to say "label" not "overall"
    train = train_data.withColumn('label', F.col('overall')).drop('overall')
    test = test_data.withColumn('label', F.col('overall')).drop('overall')
    
    
    dt = DecisionTreeRegressor(maxDepth=5) #Create DT object
    dt_model = dt.fit(train) #Train it
    test_dt = dt_model.transform(test) #Transform the test dataset
    
    test_dt = test_dt.withColumn('difference', F.col('label')-F.col('prediction')) #Get error
    test_dt = test_dt.withColumn('squared', F.pow(F.col('difference'), 2)) #Get squared error
    RSME = test_dt.agg(F.sqrt(F.mean(F.col('squared')))).head()[0] #Get mean squared error
    
    
    
    
    # -------------------------------------------------------------------------
    
    
    # ---------------------- Put results in res dict --------------------------
    res = {
        'test_rmse': None
    }
    # Modify res:
    res['test_rmse'] = RSME

    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    data_io.save(res, 'task_7')
    return res
    # -------------------------------------------------------------------------
    
    
def task_8(data_io, train_data, test_data):
    
    # ---------------------- Your implementation begins------------------------
    train, test = train_data, test_data

    train = train.withColumn('label', F.col('overall')).drop('overall') #Rename to "label"
    test = test.withColumn('label', F.col('overall')).drop('overall')
    
    train, valid = train.randomSplit([75.0, 25.0], 24) #Setting seed for consistency
    
    #Loop through different depths:
    depths = []
    test_depths = [5, 7, 9, 12]

    for depth in test_depths:
        dt = DecisionTreeRegressor(maxDepth=depth) #Create DT object
        dt_model = dt.fit(train) #Train it
        test_dt = dt_model.transform(valid) #Transform the test dataset

        test_dt = test_dt.withColumn('difference', F.col('label')-F.col('prediction')) #Get error
        test_dt = test_dt.withColumn('squared', F.pow(F.col('difference'), 2)) #Get squared error
        RMSE = test_dt.agg(F.sqrt(F.mean(F.col('squared')))).head()[0] #Get mean squared error
        depths.append(RMSE)
        
    #Find depth with smallest RSME
    ideal = test_depths[depths.index(min(depths))]
    
    #Find training RSME with ideal depth:
    for depth in [ideal]:
        dt = DecisionTreeRegressor(maxDepth=depth) #Create DT object
        dt_model = dt.fit(train) #Train it
        test_dt = dt_model.transform(test) #Transform the test dataset

        test_dt = test_dt.withColumn('difference', F.col('label')-F.col('prediction')) #Get error
        test_dt = test_dt.withColumn('squared', F.pow(F.col('difference'), 2)) #Get squared error
        RMSE = test_dt.agg(F.sqrt(F.mean(F.col('squared')))).head()[0] #Get mean squared error
    test_rmse = RMSE
    
    
    # -------------------------------------------------------------------------
    
    
    # ---------------------- Put results in res dict --------------------------
    res = {
        'test_rmse': None,
        'valid_rmse_depth_5': None,
        'valid_rmse_depth_7': None,
        'valid_rmse_depth_9': None,
        'valid_rmse_depth_12': None,
    }
    # Modify res:
    res['test_rmse'] = test_rmse
    res['valid_rmse_depth_5'] = depths[0]
    res['valid_rmse_depth_7'] = depths[1] 
    res['valid_rmse_depth_9'] = depths[2] 
    res['valid_rmse_depth_12'] = depths[3]


    # -------------------------------------------------------------------------

    # ----------------------------- Do not change -----------------------------
    #data_io.save(res, 'task_8') #don't save for example
    return res
    # -------------------------------------------------------------------------
