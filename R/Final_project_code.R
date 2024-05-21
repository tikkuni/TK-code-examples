library(MASS)

climate2020 = df

#PART 3

#Our estimation variable
C43b.ind = which(climate2020["data_point_name"] == "C4.3b_C2_Provide details on the initiatives implemented in the reporting year in the table below. - Estimated annual CO2e savings (metric tonnes CO2e)") 
estimated.saved.emis = climate2020[C43b.ind,] ##questions
estimated.saved.emis$response_value = as.integer(estimated.saved.emis$response_value) #as integer
sum.saved.emis.clean = estimated.saved.emis[!is.na(estimated.saved.emis["response_value"]),] #clean na values in response
total.saved.emis = aggregate(sum.saved.emis.clean$response_value, by=list(sum.saved.emis.clean$organization), sum) #

#risk values
risks.ind = which(climate2020['question_number'] == "C2.3")
enviromental.risks.bi = climate2020[risks.ind,]
organization = enviromental.risks.bi$organization
Yes_No = enviromental.risks.bi$response_value #Identified environmental risks
environment.risk.df = data.frame(organization, Yes_No)
environment.risk.df$Yes_No[environment.risk.df$Yes_No == ""] = "No" #changing no-values to No by assumption


#scopes 1 or 2 partial
scope.ind = which(climate2020['table_columns_unique_reference'] == "C4.1a_c4-Scope(s) (or Scope 3 category)")
scopes.types = climate2020[scope.ind,]
scope.one = scopes.types[which(scopes.types$response_value == "Scope 1+2 (location-based)" | scopes.types$response_value == "Scope 1+2 Scope 1+2 (market-based)" | scopes.types$response_value == "Scope 1"),]
scopes.company.absolute = unique(scope.one[("organization")])
scope.ind.int = which(climate2020['table_columns_unique_reference'] == "C4.1b_c4-Scope(s) (or Scope 3 category)")
scopes.types.int = climate2020[scope.ind,]
scope.one.int = scopes.types.int[which(scopes.types.int$response_value == "Scope 1+2 (location-based)" | scopes.types.int$response_value == "Scope 1+2 Scope 1+2 (market-based)" | scopes.types.int$response_value == "Scope 1"),]
scopes.company.intensity = unique(scope.one.int[("organization")])
#combine the intensity and absolute
totals = c(scopes.company.intensity$organization,scopes.company.absolute$organization)
scopes.tot = data.frame(totals)
scopes.tot.clean = unique(scopes.tot[("totals")])
positive = rep(1, length(scopes.tot.clean$totals))
scopes.tot.clean$scopes = positive #adding a row of 1s for the ones we found scopes in ##

#Energy spending C8.1
#This assumes that unknowns are below 50% which is a fair assumption for most
energy.spending.ind = which(climate2020['question_number'] == "C8.1")
energy.spending = climate2020[energy.spending.ind,]
factors.energy = as.integer(as.factor(energy.spending$response_value))
factors.energy[factors.energy < 13] = 0  #changing all values below 50 to 0
factors.energy[factors.energy >= 13] = 1 #changing all values above 50 to 1
factor.energy.df = data.frame(energy.spending$organization, factors.energy) #

investment.ind = which(climate2020['column_name'] == 'C4.3b_C6Investment required (unit currency Ã¢â,¬â???o as specified in C0.4)')
investment.df = climate2020[investment.ind,]
investment.df.clean = investment.df[investment.df["response_value"] != "",]
investment.df.clean$response_value = investment.df.clean$response_value[is.na(investment.df.clean$response_value)] = 0
investment.df.clean$response_value = as.integer(investment.df.clean$response_value)
total.investment.df = aggregate(investment.df.clean$response_value, by=list(investment.df.clean$organization), sum) # basically python group by sum on the investments

#Combining everything
main.comparison.df = merge(total.saved.emis, environment.risk.df, by.x = "Group.1", by.y = "organization")
main.again = merge(main.comparison.df, scopes.tot.clean, by.x = "Group.1", by.y = "totals", all= TRUE)
main.again$scopes[is.na(main.again$scopes)] = 0
main.adding.e = merge(main.again, factor.energy.df, by.x = "Group.1", by.y = "energy.spending.organization")
main.last = merge(main.adding.e, total.investment.df, by.x = "Group.1", by.y = "Group.1", all=TRUE)

#final clean up
colnames(main.last)[colnames(main.last) == "x.y"] = "Total.Invest" #total investment into (name change)
colnames(main.last)[colnames(main.last) == "x.x"] = "Total.Saved.Emis" #estimated saved emissions on current initiatives (name change)
colnames(main.last)[colnames(main.last) == "Yes_No"] = "Identified.Environment.Risks" #Yes or No for identified environmental risks that might affect business
colnames(main.last)[colnames(main.last) == "scopes"] = "Scope.one.emit.Yes"
colnames(main.last)[colnames(main.last) == "factors.energy"] = "Below.50per.Energy"

saved.emis.combined = main.last[!is.na(main.last["Total.Saved.Emis"]),] #only using values the estimator has
saved.emis.combined$Identified.Enviroment.Risks = ifelse(saved.emis.combined$Identified.Enviroment.Risks == "Yes", 1, 0) #changing to binary 
saved.emis.combined$Total.Invest[is.na(saved.emis.combined$Total.Invest)] = 0 #NA values to 0




#Using a premade function for correlation panels
panel.cor <- function(x, y, digits = 2, prefix = "", cex.cor, ...) {
  usr <- par("usr")
  on.exit(par(usr))
  par(usr = c(0, 1, 0, 1))
  Cor <- abs(cor(x, y))
  txt <- paste0(prefix, format(c(Cor, 0.123456789), digits = digits)[1])
  if(missing(cex.cor)) {
    cex.cor <- 0.4 / strwidth(txt)
  }
  text(0.5, 0.5, txt,
       cex = 1 + cex.cor * Cor) #level of correlation text size
}

# plotting the correlation matrix
pairs(Total.Saved.Emis ~ Scope.one.emit.Yes + Total.Invest + Identified.Environment.Risks + Below.50per.Energy, data = saved.emis.combined, upper.panel = panel.cor)


#PART 4

#testing lamba for lm ridge

emis.lm = lm(Total.Saved.Emis ~., data = saved.emis.combined[,-1]) #everything except the company name column
summary(emis.lm) # Picture of the graph for number 4

emis.ridge = lm.ridge(Total.Saved.Emis ~., data = saved.emis.combined[,-1], lambda = seq(0,100, 0.1))
plot(emis.ridge$GCV, ylab = "Ridge", xlab = "Lambda Studied 0 - 100 by 0.1") #Curve graph for GCV values (cross validation values)
select(emis.ridge)

reg = lm.ridge(Total.Saved.Emis ~., data = saved.emis.combined[,-1], lambda = 75.6)
coef(reg)