function finalproject(){
    tests();
    bargraphs();
    generate20species();
}

// Global variables for colors on the page, these are the same in style.css
var bg_color = 'rgb(55, 54, 64)';
var drop_color = 'rgb(63, 63, 72)';
var aux_color = 'rgb(99, 104, 110)';
var txt_color = 'rgb(182, 247, 193)';
var plot_bg_color = 'rgb(126, 151, 166)';
var alt_txt_color = 'rgb(235, 221, 191)';
var alert_tone = 'rgb(204, 51, 0)';
var button_color = 'rgb(46, 64, 87)';
var stroke_color = 'rgb(93, 114, 134)';

function tests() {
    var t = d3.select('.test')
    console.log(t)

}

function bargraphs(){
    
}

function generate20species() {
    // Define the initial population with random genes and species names based on the first 4 genes

    let population = [];
    for (var i = 0; i < 100; i++) { // i < how many species
      let genes = [];
      let speciesName = ''; // Species name ex. 'Species 7'
      let strength = 0;
      let size = 0;
      let habitat = '';
      for (var j = 0; j < 20; j++) { // j < how many genes per gene array
        genes.push(Math.round(Math.random())); //out 0 or 1
      }
      let sizePat = genes.slice(6, 9).join('');
      let speciesPattern = genes.slice(0, 4).join('');
      let strengthPat = genes.slice(3, 6).join('');
      let habitatPat = genes.slice(9, 11).join('');
      speciesName = `Species ${parseInt(speciesPattern, 2)}`;
      strength = parseInt(strengthPat, 2); // 0-7 decides fitness
      size = parseInt(sizePat, 2); // 0-7 decides visual differences 
      habitat = parseInt(habitatPat, 2); // 0-3 {0: 'Grassland', 1: 'Rainforest', 2: 'Forest', 3: 'Wetland'}
      population.push({genes, species: speciesName, strength: strength, size: size, habitat_preference: habitat});
    }
    // [1, 1, 1, 0,| 1, 1, 1, 0, 0,  1, 1,   1, 1, 1, 1, 1, 0, 1, 0, 1]
    //|species type|                          |    RANDOM FOR NOW    |
    //          |strength|| size | |habitat|
    
    //console.log(population)

    var generations = [] // keep track of our generations
    for (let generation = 1; generation <= 30; generation++) {
      // Calculate the fitness of each individual
      population.forEach(individual => { 
        let fitness = 0; //higher this is compared to others in the population, the higher chance of reproduction
        if (individual.strength >= 1) {fitness += 1} //testing assumptions
        if (individual.size >= 2 & individual.habitat_preference == 2) {fitness += 2}
        if (individual.size <= 3 & individual.habitat_preference == 1) {fitness -= 3}
        if (individual.strength > 5 & individual.habitat_preference == 1) {fitness += 1}
        if (individual.habitat_preference == 0) {fitness += 1}
        if (individual.habitat_preference == 3 & individual.strength <= 1) {fitness += 1}
        // COMPELETELY RANDOM FITNESS CHANGES
        individual.genes.slice(11,20).forEach(gene => {
          fitness += gene;
        });
        individual.fitness = fitness;
      });

      // Sort the population by fitness
      population.sort((a, b) => b.fitness - a.fitness);

      // Select the fittest individuals to reproduce
      let parents = population.slice(0, 50);

      // Reproduce and mutate to create the next generation
      let nextGeneration = [];
      for (var i = 0; i < 100; i++) {
        let parent1 = parents[Math.floor(Math.random()* parents.length)]; //assumption rn breeding with different species
        let parent2 = parents[Math.floor(Math.random()* parents.length)]; 
        let childGenes = []; 
        let strength = 0;
        let size = 0;
        let habitat = '';
        for (var j = 0;j<20; j++) {
          let gene = Math.random() < 0.5 ? parent1.genes[j] : parent2.genes[j]; //mix the genes 
          //if (Math.random() < 0.1) {
          //  gene = gene == 0 ? 1 : 0; // flip the bit with a 10% chance
          //}
          childGenes.push(gene);
        }
        let sizePat = childGenes.slice(6, 9).join('');
        let strengthPat = childGenes.slice(3, 6).join('');
        let habitatPat = childGenes.slice(9, 11).join('');
        strength = parseInt(strengthPat, 2); // 0-7 decides fitness
        size = parseInt(sizePat, 2); // 0-7 decides visual differences 
        habitat = parseInt(habitatPat, 2);
        let speciesPattern = childGenes.slice(0, 4).join('');
        let speciesName = "Species " + parseInt(speciesPattern, 2);
        nextGeneration.push({genes: childGenes, species: speciesName, strength: strength, size: size, habitat_preference: habitat});
      }
      sCounts = d3.rollup(nextGeneration, v => v.length, d => d.species)
      generations.push({pool: nextGeneration, count_map: sCounts, gen: generation});
      // Replace the old population with the new generation
      population = nextGeneration;
    }
    console.log(generations, 'here')
    // Sort the final population by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    sCounts = d3.rollup(population, v => v.length, d => d.species)
    console.log(sCounts)
    const speciesArray = Array.from({length:16}, (_,i) => "Species " + i); //species 0 - species 15
    console.log(speciesArray)
    var itp = d3.interpolateViridis;
    var colors = d3.scaleOrdinal()
                    .domain(speciesArray)
                    .range(d3.quantize(itp, 16))
    
    /*
       **************
       Visualizations
       **************
    */

    
    /*
       Bargraph
    */

    var svg_h = 500
    var svg_w = 500
    var pad = 55
    var svg = d3.select('#q1_plot')
                .append('svg')
                .attr('width', svg_w)
                .attr('height', svg_h)
                .attr('id', 'barplot')

     //START of bar function

    function changeBar(gen_num) {
        pad = 55
        var speciGen =  d3.filter(generations, d => d.gen == gen_num)[0].count_map;
        var xScale = d3.scaleBand()
                        .domain(speciesArray)
                        .range([pad, svg_w])
                        .padding(0.2);
        var b_yScale = d3.scaleLinear()
                            .domain([0, d3.max(speciGen, function(d) {
                                return 100//d[1] <- if we want updating y axis, but not needed
                            })])
                            .range([svg_h - pad, pad])
        var rect = svg.selectAll('rect').data(speciGen)
        
        rect.exit().transition().duration(1800).ease(d3.easeBounceOut).attr('fill', 'black').attr('x', 1000).remove()
        const cubic = d3.easePoly.exponent(3);
        rect.on("mouseover", function (_, d) {
            d3.select(this).attr('stroke', txt_color).attr('stroke-width', '3px')
            let path = s_svg.select('path[species="' + d[0] + '"]');
            path.style('fill', aux_color);
        })
        .on("mouseout", function (_, d) {
            d3.select(this)
                    .attr('stroke-width', 0)
            let path = s_svg.select('path[species="' + d[0] + '"]');
            path.style('fill', d=> colors(d3.select(this).attr('species')));
        })

        rect.enter()
           .append('rect')
           .merge(rect) // GIVE MMEMEME Change YAHOO
           
           .transition()
           .duration(300)
           
           .ease(cubic)
           
           .attr('class', 'bar')
           .attr('species', d => d[0]) // Adding data to rect to be able to reference back later
           .attr('x', d=> xScale(d[0]))
           .attr('y', d => b_yScale(d[1]))
           .attr('width', xScale.bandwidth())
           .attr('height', d=> (svg_h - pad) - b_yScale(d[1]))
           .attr('fill', stroke_color)
           
    
        var b_yAxis = d3.axisLeft(b_yScale)
        d3.select('.q2_axis')
            .remove()
            .transition()
            .call(b_yAxis)
        svg.append("g") // Y-axis
            .attr('transform', "translate(" + pad + "," + (0) + ")")
            .attr("class","q2_axis")
            .call(b_yAxis)
            .selectAll("text")
            .attr('fill', txt_color)
            .append("text")
            .attr("dx", "-.1em")
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
    } // ENd of bar update

    changeBar(1) // initial state
    var xScale = d3.scaleBand()
                        .domain(speciesArray)
                        .range([pad, svg_w])
                        .padding(0.2);
    var xAxis = d3.axisBottom(xScale)
    svg.append('g') // X-axis
        .attr('class', 'b_axis')
        .attr('transform', 'translate(0,' + (svg_h -pad) + ')')
        .call(xAxis)
        .selectAll('text')
        .attr('fill', txt_color)
        .style("text-anchor", "end")
        .attr("dx", "-.2em")
        .attr("dy", ".6em")
        .attr("transform", "rotate(-30)")
    svg.append('text') // X-axis label
		.attr('y', svg_h-5)
		.attr('x', svg_w/2)
		.attr('text-anchor', 'middle')
		.attr('font-size', '13px')
		.attr('fill', alt_txt_color)
        .attr('font-family', 'arial')
        .text('Species')
    svg.append('text') // Y-axis label
        .attr('dy', '2.0em')
        .attr('dx', '-20.0em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('transform', 'rotate(-90)')
        .attr('fill', alt_txt_color)
        .attr('font-family', 'arial')
        .text('Count');
    svg.append('text') //title
        .attr('y', 25)
        .attr('x', svg_h - 220)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'arial')
        .attr('font-size', '20px')
        .attr('fill', alt_txt_color)
        .text('Bargraph of Sum for Each Species Type')

    /*
       STREAM GRAPH
    */

    var svg_s_w = 700
    console.log(generations[0].count_map.get("Species 10"))
    gens = new Set(generations.map(d=>d.gen));
    var s_svg = d3.select('#q1_plot')
       .append('svg')
       .attr('width', svg_s_w)
       .attr('height', svg_h)
       .attr('id', 'stream')
    /*
    s_svg.append('rect')
        .attr('y', 30)
        .attr('width', svg_s_w)
        .attr('height', (svg_h - (30*3))+ 5)
        .attr('fill', 'black')
    */
    var stack = d3.stack()
                    .offset(d3.stackOffsetNone)
                    .keys(speciesArray)
                    .order(d3.stackOrderNone)
                    .value(function(d, key) {
                        //console.log(d.count_map, key)
                        let speciesSum = d.count_map.get(key);
                        if (!speciesSum) {return 0;}
                        return speciesSum
                    })
                    (generations)

    //var newDomain = [...new Set([...gens, ...[31,32,33,34,35,36,37,38,39,40]])]
    var xScale = d3.scaleBand()
                .domain(gens)
                .range([0, svg_s_w])
                .padding([1]);
    var s_yScale = d3.scaleLinear()
                .domain([0, 100]) //assuming always 100 species
                .range([svg_h - pad, pad])
    var Tooltip = d3.select('#q1_plot').append("div").style("opacity", 0).attr("class", "tooltip");
    s_svg.selectAll('path')
         .data(stack)
         .enter()
         .append('path')
         .attr('species', d => d.key)
         .attr('stroke', function(d) {return colors(d.key);})
         .attr('stroke-width', '2px')
         .style('fill', d => colors(d.key))
         .attr('d', d3.area()
                        .x(d=>xScale(d.data.gen))
                        .y0(d => s_yScale(d[0]))
                        .y1(d => s_yScale(d[1]))
         )
         .on("mouseover", function (e, d) {
            //console.log(this);
            d3.select(this)
                    .style('fill', aux_color);
            let rect = svg.select('rect[species="' + d.key + '"]');
            rect.attr('stroke', txt_color).attr('stroke-width', '3px')
            Tooltip.transition()
                   .duration(50)
                   .style("opacity", 1)

            Tooltip.html(d.key)
                   .style("left", (d3.pointer(e)[0]) + "px")
                   .style("top", (d3.pointer(e)[1]) + "px")
         })
         .on("mousemove", function (e, d) {
            Tooltip
                .html(d.key)
                //.style('display', 'block')
                .style("left", (d3.pointer(e)[0]) +730+ "px")
                .style("top", (d3.pointer(e)[1]) + 280 + "px");
         })
         .on("mouseout", function (e, d) {
            d3.select(this)
                        .style('fill', d => colors(d.key))
           Tooltip.transition()
                  .duration(100)
                  .style("opacity", 0);
            let rect = svg.select('rect[species="' + d.key + '"]');
            rect.attr('stroke', stroke_color).attr('stroke-width', '0px')
         });
    var sXaxis = d3.axisBottom(xScale)
    var sYaxis = d3.axisRight(s_yScale)
    s_svg.append('g') // Y-axis
        .attr('class', 's_axis')
        .attr('transform', "translate(" + (svg_s_w -20) + "," + (0) + ")")
        .call(sYaxis)
        .selectAll('text')
        .attr('fill', txt_color)
        .style("text-anchor", "start")
        .attr("dx", "-.5em")
        .attr("dy", "-.4em")
    s_svg.append('g') // X-axis
        .attr('class', 's_axis')
        .attr('transform', 'translate(0,' + (svg_h -pad) + ')')
        .call(sXaxis)
        .selectAll('text')
        .attr('fill', txt_color)
        .style("text-anchor", "end")
        .attr("dx", ".5em")
        .attr("dy", ".8em")

    
    var linegen = d3.line()
        .x(d => xScale(d.g))
        .y(d => d.y);
    var lg = s_svg.append('g').attr('class', 'lg')
    lg.append('path')
            .attr('class', 'line')
    const startline = [
                { g: 1 , y:445},
                { g: 1, y: 35 }
              ];
    console.log(lg.select('.line'))
    lg.select('.line')
        .data([startline])
        .attr('d', linegen)
        .attr('stroke-width', 2)
        .attr('stroke', txt_color)
        .style("stroke-dasharray","5,5")
    
    s_svg.append('text') // X-axis label
		.attr('y', svg_h-5)
		.attr('x', svg_s_w/2)
		.attr('text-anchor', 'middle')
		.attr('font-size', '13px')
		.attr('fill', alt_txt_color)
        .attr('font-family', 'arial')
        .text('Generation')
    s_svg.append('text') // Title
        .attr('y', 25)
        .attr('x', svg_s_w/2)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'arial')
        .attr('font-size', '20px')
        .attr('fill', alt_txt_color)
        .text('Streamgraph Species Count')

    function genIndicator(val) {
        line_data = [
            {g: val, y: s_yScale.range()[0]},
            {g: val, y: s_yScale.range()[1] -15}
        ]
        lg.select('.line')
            .data([line_data])
            .transition()
            .duration(500)
            .attr('d', linegen)
    }

    /*
       SCATTER PLOT
    */

    var p_svg_h = 650
    var p_svg_w = 650
    var pad = 100
    var p_svg = d3.select('#q2_plot')
                   .append('svg')
                   .attr('width', p_svg_w)
                   .attr('height', p_svg_h)
                   .attr('id', 'plot')
    var p_yScale = d3.scaleLinear()
                .domain([0, 7]) // we know this from how the data is generated
                .range([p_svg_h - pad, pad])
    var p_xScale = d3.scaleLinear()
                .domain([0, 7])
                .range([pad, p_svg_w - pad + 10]) // 10 is for offset from y axis so it's not over the line

    // Button ****
    var butt_s = d3.select('#q2_plot') // flushed 😳
       .append('svg')
       .attr('width', 200)
       .attr('height', 650)
       .attr('id', 'toggleLegend')
    butt_s.append('rect')
        .attr('id', 'button')
        .attr('width', 200)
        .attr('height', 50)
        .attr('rx', 5)
        .attr('fill', alt_txt_color)
        .on("mouseover", function (_, d) {
            d3.select(this).attr('fill', txt_color)
        })
        .on("mouseout", function (_, d) {
            d3.select(this).attr('fill', alt_txt_color)
        })
    butt_s.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 100)
        .attr('y', 33) //idk why it needs this
        .attr('fill', 'black')
        .attr('font-size', '18px')
        .attr('font-family','arial')
        .text('Toggle Species')
    var h_box = butt_s.selectAll('.H_item')
                    .data(speciesArray) //lazy approach, always the same 15 species
                    .enter()
                    .append('g')
                    .attr('class', 'H_item')
                    .attr('transform', (d, i) =>`translate(${10}, ${(i * (30)) + 50})`)
    h_box.append('rect')
        .attr('width', 180)
        .attr('height', 40)
        .attr('fill', drop_color)
    h_box.append('circle')
        .attr('cx', 40)
        .attr('cy', 20)
        .attr('r', 7)
        .attr('fill', d=>colors(d))
    h_box.append('text')
        .attr('font-family','arial')
        .attr('font-size', '13px')
        .attr('fill', txt_color)
        .attr('x', 70)
        .attr('y', 25)
        .text(d=>d)
    h_box.attr('opacity', 0)
    // Button end


    //console.log(generations)
    p_svg.selectAll("path.verticalGrid").data(p_yScale.ticks(7)).enter()
    .append("path")
    .attr('stroke', plot_bg_color)
    .attr('stroke-width', '2px')
    .attr('opacity', '.5')
    .attr('d', function(d) {
        return 'M' + 90 + ',' + p_yScale(d) + 'L' + (p_svg_w - 70) + ' ' + p_yScale(d);
    })
    p_svg.selectAll("path.horizontalGrid").data(p_xScale.ticks(7)).enter()
        .append("path")
        .attr('stroke', plot_bg_color)
        .attr('opacity', '.5')
        .attr('stroke-width', '2px')
        .attr('d', function(d) {
            return 'M' + p_xScale(d) + ',' + (pad - 15) + 'L' + p_xScale(d) + ' ' + (p_svg_w - pad + 10);
    })
    function changeScatter(gen_num) {
        
        var speciGen =  d3.filter(generations, d => d.gen == gen_num)[0].pool;
        var point = p_svg.selectAll('circle').data(speciGen)
        point.exit().remove()
        point.enter()
            .append('circle')
            .attr('cx', 700)
            .attr('cy', 300)
            .merge(point)
            .transition()
            .duration(1000)
            .attr('class', 'point')
            .attr('species', function(d) {
                                return d.species
            })
            .attr('cy', d => p_yScale(d.size))
            .attr('cx', d => p_xScale(d.strength))
            .attr('r', 5)
            .attr('fill', 'yellow')
        var wake = false
        var tbutt = d3.select('#button')
        tbutt.on('click', function(e, d) {
            wake = !wake
            point.transition()
                    .duration(500)
                    .attr('fill', function(d) {
                        if (wake) {
                            h_box.transition().duration(300).attr('opacity', 1);
                            return colors(d.species)
                        } else {h_box.transition().duration(300).attr('opacity', 0); return 'yellow'}
                    })
            
                
        })
        var simulation = d3.forceSimulation(speciGen)
            .force("x", d3.forceX(function(d) { return p_xScale(d.strength); }))
            .force("y", d3.forceY(function(d) { return p_yScale(d.size); }))
            .force("collide", d3.forceCollide(6));
        simulation.on("tick", function() {
                point.attr("cx", function(d) { return d.x; })
                     .attr("cy", function(d) { return d.y; });
            });
    }
    changeScatter(1)
    var p_xAxis = d3.axisBottom(p_xScale)
    var p_yAxis = d3.axisLeft(p_yScale)
    p_svg.append('g') // X-axis
        .attr('class', 'p_axis')
        .attr('transform', 'translate(0,' + (p_svg_h - pad+10) + ')')
        .call(p_xAxis)
        .selectAll('text')
        .attr('fill', txt_color)
        .style("text-anchor", "end")
        .attr("dx", ".2em")
        .attr("dy", ".8em")
    p_svg.append('text') // X-axis label
        .attr('y', p_svg_h-50)
        .attr('x', p_svg_w-300)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('fill', alt_txt_color)
        .attr('font-family', 'arial')
        .text('Strength')
    p_svg.append("g") // Y-axis
        .attr('transform', "translate(" + (pad - 10) + "," + (0) + ")")
        .attr("class","p_axis")
        .call(p_yAxis)
        .selectAll("text")
        .attr('fill', txt_color)
        .append("text")
        .attr("dx", "-.1em")
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
    p_svg.append('text') // Y-axis label
        .attr('dy', '4em')
        .attr('dx', '-25.0em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('transform', 'rotate(-90)')
        .attr('fill', alt_txt_color)
        .attr('font-family', 'arial')
        .text('Size');
    p_svg.append('text') // Title
        .attr('y', 40)
        .attr('x', p_svg_w-300)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'arial')
        .attr('font-size', '20px')
        .attr('fill', alt_txt_color)
        .text('Strength vs. Size for Individuals in Current Gen')

    /*
       Matrix
    */
    var m_svg_h = 550
    var m_svg_w = 600
    var m_svg = d3.select('#q2_plot')
                   .append('svg')
                   .attr('width',  m_svg_w)
                   .attr('height', m_svg_h)
                   .attr('id', 'matrix')
    const colorScale = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateYlGnBu);
    var csize = 5

    // change Matrix 
    function changeMatrix(gen_num) {
        var pop = d3.filter(generations, d => d.gen == gen_num)[0].pool
        var poolArray = pop.map(d => d.genes);
        var simMatrix = poolArray.map((row) => // JACCARD SIMILARITY
            poolArray.map((col) => { 
                var intersection = row.filter((d,k) => d === col[k] && d === 1).length;
                var u= row.filter((d,k) => d ===1||col[k] === 1).length;
            return intersection/u;
            }) 
        );
        var rows = m_svg.selectAll('.row')
                        .data(simMatrix);

        rows.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove()
        
        var nrows = rows.enter()
                        .append('g')
                        .merge(rows)
                        .attr('class', 'row')
                        .attr('transform', (_, i) => "translate(0," + ((i * csize)+ 50) + ")")
                        .style('opacity', 1)
        
        var cells = nrows.selectAll('.cell')
                        .data(d => d)
        cells.exit()
            .transition()
            .duration(600)
            .style('opacity', 0)
            .remove()                
        cells.enter()
            .append('rect')
            .merge(rows.selectAll('.cell'))
            .attr('class', 'cell')
            .attr('x', (_, i) => i * csize)
            .attr('height', csize)
            .attr('width', csize)
            .attr('fill', d=> colorScale(d))
            .style('opacity', 1);
        cells.transition()
            .duration(500)
            .style('opacity',1)
            .attr('x', (_, i) => i * csize);

    } //end of change matrix
    changeMatrix(1)
    leg_vals = [1, 0.75, 0.5, 0.25, 0]
    var legend = m_svg.append('g')
                    .attr('class', 'm_legend')
                    .attr('transform', 'translate(' + ((510)) + ',' + (90) + ')')
        legend.append('text')
              .attr('y', -20)
              .attr('x', 15)
              .attr('fill', alt_txt_color)
              .text('Similarity')
              .attr('font-family', 'arial')
              .attr('font-size', '13px')
        var box = legend.selectAll('.it')
                    .data(leg_vals)
                    .enter()
                    .append('g')
                    .attr('class', 'it')
                    .attr('transform', (d,i) => `translate(0, ${(i * (25)) })`)
        box.append('rect')
            .attr('width', 15)
            .attr('height',15)
            .attr('fill', (d) => colorScale(d))
        box.append('text')
            .attr('x',25) // depends on how big the bandwidths are
            .attr('y',+13)
            .attr('fill', alt_txt_color)
            .attr('font-family', 'arial')
            .attr('font-size', '15px')
            .text(d => d)
    m_svg.append('text') // Title
            .attr('y', 20)
            .attr('x', m_svg_w - 340)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'arial')
            .attr('font-size', '20px')
            .attr('fill', alt_txt_color)
            .text('Similarity Adjacency Matrix for Individual Genes')    

    /*
       GEO DENSITY
    */
   var geoObj = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
            "habitat": "Grassland"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[114, 36],[100,50],[171, 12], [149, -10], [100, -10], [200, -100]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
            "habitat": "Rainforest"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[14, 56], [53, 50], [63, 31], [71, 32], [49, -13], [38, -15], [27, 25], [3, 34], [14, 56]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "habitat": "Forest"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[10, 60], [93, 90], [103, 71], [89, 27], [78, 25]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
            "habitat": "Wetland"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[143, -11], [153, -28], [144, -38], [131, -31], [116, -35], [114, -22], [136, -12], [140, -17], [143, -11]]]
        }
      },
    ]
  };
    var width =300;
    var height = 300;
    // Create the SVG element
    var g_svg = d3.select("#q2")
         .append("svg")
         .attr("width", width)
         .attr("height", 200);
    var projection = d3.geoEquirectangular()
                .scale(50)
                .translate([20, 150]);
    var converth = {'Grassland':0, 'Rainforest':1,  'Forest':2, 'Wetland':3}
    var convert = {0:'Grassland', 1: 'Rainforest', 2: 'Forest', 3: 'Wetland'}
    var pathGenerator = d3.geoPath().projection(projection);
    const choro = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateReds);
    function changeMap(gen_num) {
        var pop = d3.filter(generations, d => d.gen == gen_num)[0].pool
        var habitatArray = pop.map(d => d.habitat_preference);
        var bin = d3.histogram()
                .domain([0,3])
                .thresholds(d3.range(0,4))
                (habitatArray)
        var density = bin.map(a => a.length / 100)
        console.log(density)
        for(var i = 0; i < 4; i++) {
            var jsondat = converth[geoObj.features[i].properties.habitat]
            geoObj.features[i].properties.value = density[jsondat]            
        }
        var mg = g_svg.selectAll('.map')
                        .data(geoObj.features);
                //.attr("class", "map")
        mg.exit()
          .transition()
          .duration(500)
          .remove()
        mg.enter()
            .append('g')
            .merge(mg)
            .attr('class', 'map')
        var paths = mg.selectAll('.continent')
                        .data(geoObj.features)
        console.log(paths, 'hi')
        paths.exit()
            .transition()
            .duration(500)
            .remove()
        paths.enter()
                .append("path")
                .merge(mg.selectAll('.continent'))
                .attr('class', 'continent')
                .attr("d", pathGenerator)
                .style("fill", function(d) {
                    var value = d.properties.value;
                    if(value) {
                        return choro(value)
                    } else {return 'tomato'}
                })
                .style("stroke", "white")
                .style("stroke-width", "1px");
    }
    changeMap(1)
    changeMap(1)
    // THIS CODE IS SO CURSED NOT A GOOD EXAMPLE OF USING GEO DATA
    leg_vals = [1, 0.75, 0.5, 0.25, 0]
    var g_legend = g_svg.append('g')
                    .attr('class', 'g_legend')
                    .attr('transform', 'translate(' + ((180)) + ',' + (90) + ')')
        g_legend.append('text')
              .attr('y', -20)
              .attr('x', 0)
              .attr('fill', alt_txt_color)
              .text('Density Legend')
              .attr('font-family', 'arial')
              .attr('font-size', '12px')
        var box = g_legend.selectAll('.it')
                    .data(leg_vals)
                    .enter()
                    .append('g')
                    .attr('class', 'it')
                    .attr('transform', (d,i) => `translate(0, ${(i * (15)) })`)
        box.append('rect')
            .attr('width', 10)
            .attr('height',10)
            .style("stroke", "white")
            .style("stroke-width", "1px")
            .attr('rx', 4)
            .attr('fill', (d) => choro(d))
        box.append('text')
            .attr('x',25) // depends on how big the bandwidths are
            .attr('y',+13)
            .attr('fill', alt_txt_color)
            .attr('font-family', 'arial')
            .attr('font-size', '15px')
            .text(d => d)
    g_svg.append('text') // Title
            .attr('y', 40)
            .attr('x', 150)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'arial')
            .attr('font-size', '20px')
            .attr('fill', alt_txt_color)
            .text('Density of Habitat')

    /*
       SLIDER
    */


    var slider = d3.sliderHorizontal()
       .min(1)
       .max(30)
       .step(1)
       .width(650)
       .height(300)
       .fill('yellow')
       .displayValue(true)
       .silentValue(1)
       .tickValues(gens)
       .on('onchange', (val) => {
            changeBar(val) //in bargraph section
            genIndicator(val) // in streamgraph section
            changeScatter(val)
            changeMatrix(val)
            changeMap(val)
       });
   
    var slide = d3.select('#q2')
       .append('svg')
       .attr('width', 700)
       .attr('height', 100)
       .attr('id', 'genslide')
    slide.append('rect')
       .attr('x', 0)
       .attr('y', 10)
       .attr('width', 700)
       .attr('height', 80)
       .attr('rx', 10)
       .attr('fill', drop_color)
    slide.append('text')
       .attr('text-anchor', 'middle')
       .text('Generation Slider')
       .attr('x', 340)
       .attr('y', 30)
       .attr('font-size', '18px')
       .attr('font-family','arial')
       .attr('fill', alt_txt_color)
    slide.append('text')
       .text('⬇️ Try Me!')
       .attr('x', 15)
       .attr('y', 30)
       .attr('fill', txt_color)
    slide.append('g')
       .attr('transform', 'translate(25,45)')
       .call(slider)
    
}