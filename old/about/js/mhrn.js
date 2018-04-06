function add_random_subgraph (n, p, G, edge_list, start_node) {
    if (p>=1.0) {
        for (var v=start_node; v<start_node+n-1; v++) {
            for (var w=v+1; w<start_node+n; w++) {
                G[w].add(v);
                G[v].add(w);
                edge_list.push({ source: w,
                                 target: v,
                                 layer: 1,
                });
            }
        }
    } else if (p>0.0) {
        var v = 1;
        var w = -1;
        var log1mP = Math.log(1-p);
        while (v<n) {
            var r = Math.random();
            w = w + 1 + Math.floor( Math.log(1-r) / log1mP );
            while ( (w>=v) && (v<n) ) {
                w = w - v;
                v++;
            }
            if (v<n){
                G[w+start_node].add(v+start_node);
                G[v+start_node].add(w+start_node);
                var edge = {};
                if (v<w) {
                    edge.source = v+start_node;
                    edge.target = w+start_node;
                } else {
                    edge.source = w+start_node;
                    edge.target = v+start_node;
                }
                edge.layer = 1;
                edge.label = edge.source + "-" + (G[edge.source].size-1);
                edge_list.push(edge);
            }
        }
    }
}

// get random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min; 
}

function binom(n,p) {
    var I = 0;
    var threshold = -Math.log(1.0-p);
    var S = 0;

    while (true) {
        Y = -Math.log(Math.random());
        S += Y / (n-(I+1)+1.0);
        if ( S > threshold) {
            return I;
        } else {
            I = I + 1;
        }
    }
}

function get_mhrn_edge_list (B,L,k,xi) {

    var n = Math.pow(B,L);
    var edge_list = [];
    var G = [];

    for(var node=0; node<n; node++) {
        G.push(new Set([]));
    }

    var p1;
    if ( xi == 1.0 ) {
        p1 = k / (B-1.0) / L;
    } else {
        p1 = k / (B-1.0) * (1.0-xi) / (1.0-Math.pow(xi,L));
    }

    var p = [];
    p.push(p1);
    for (var l=2; l<=L; l++) {
        p.push( p1*Math.pow(xi/B,l-1) );
    }

    for (var start_node = 0; start_node<n; start_node+= B) {
        add_random_subgraph(B,p1,G,edge_list,start_node);
    }

    for (var l=2; l<=L; l++) {
        var m_max = Math.pow(B,(L+l-1))*(B-1) / 2;
        var current_m_l = binom(m_max,p[l-1]);

        for (var m = 0; m<current_m_l; m++) {
            var B_l = Math.pow(B,l);
            var B_lm1 = Math.pow(B,l-1);
            var already_contains_edge = true;

            while (already_contains_edge) {
                var w = Math.floor(N*Math.random());
                var b = Math.floor( w / B_l );
                var b_lower = Math.floor( w / B_lm1 );
                var v = getRandomInt(b*B_l,(b+1)*B_l-1);

                while (b_lower == Math.floor(v / B_lm1)) {
                    v = getRandomInt(b*B_l,(b+1)*B_l-1);
                }
                already_contains_edge = G[w].has(v);

                if (! already_contains_edge) {
                    G[w].add(v);
                    G[v].add(w);

                    var edge = {};
                    if (v<w) {
                        edge.source = v;
                        edge.target = w;
                    } else {
                        edge.source = w;
                        edge.target = v;
                    }
                    edge.layer = l;
                    edge.label = edge.source + "-" + (G[edge.source].size-1);
                    edge_list.push(edge);
                }
            }
        }
    }

    return edge_list;
}
