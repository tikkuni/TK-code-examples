---- FILE FOR HW 3

Select F.origin_city, Max(F.actual_time), F.dest_city
from flights as F
group by F.origin_city, F.dest_city
order by F.origin_city, F.dest_city DESC;


--- 1

Select Distinct F.origin_city, F.dest_city, F.actual_time
From Flights F 
Join (Select origin_city, Max(actual_time) As maximum_time
	   From Flights As team Group by origin_city) small
On F.origin_city = small.origin_city
And F.actual_time = small.maximum_time
Order by F.origin_city, F.dest_city;



--- 2

Select Distinct F.origin_city as city
From Flights F
Join (select origin_city, max(actual_time) as max from Flights
Group by origin_city) city
On city.origin_city = F.origin_city AND
F.actual_time = city.max
Where F.actual_time < 180.0; 


--- 3


Select F.origin_city, 
(CAST(cnt AS NUMERIC(10, 2))*100 / CAST(count(F.fid) AS NUMERIC(10, 2))) percent
From Flights F
LEFT JOIN (Select origin_city, count(fid) cnt
From Flights 
Where actual_time < 180.0 OR (actual_time IS null)
Group by origin_city) c
ON F.origin_city = c.origin_city
Group by F.origin_city, cnt
Order by percent ASC;


--- 4

Select city.dest_city as city
From Flights F
JOIN (select origin_city, dest_city From Flights
Where dest_city != 'San Diego CA' 
AND dest_city NOT IN 
(SELECT dest_city From Flights 
Where origin_city = 'San Diego CA')
Group by origin_city, dest_city) city
ON F.dest_city = city.origin_city
Where F.origin_city = 'San Diego CA' 
group by city.dest_city
order by city.dest_city;

--- 5

Select dest_city 
From Flights
Where (origin_city = "San Diego CA" and dest_city = "San Francisco CA")
OR (origin_city = "San Francisco CA" and dest_city = "San Diego CA")
(Select * 
From Flights F
where origin_city = "San Diego CA" );


--- 6

Select dest_city 
From Flights
Where (origin_city = "San Diego CA" and dest_city = "San Francisco CA")
OR (origin_city = "San Francisco CA" and dest_city = "San Diego CA")