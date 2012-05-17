/* id starts with 1. 
 * 0 is for the default option.
 */
function createOptions(metrics_defs) {
    var current_metric_def, current_attribute, mapping, id = 1,
        attributes_match = [];
    for (var i = metrics_defs.length - 1; i >= 0; i--) {
        current_metric_def = metrics_defs[i];
        attributes_match = [];

        for (var j = attributes.length - 1; j >= 0; j--) {
            current_attribute = attributes[j];
            mapping = selectMapping(current_metric_def, current_attribute);
            if (mapping !== undefined) {
                attributes_match.push({
                    id: id++,
                    name: current_attribute,
                    setAttribute: mapping.setAttribute
                });
            }
        }
        if (attributes_match.length !== 0) {
            options.data.push({
                metric_def: current_metric_def,
                attributes: attributes_match
            });
        }

    }
    return options;

}

function rgb_to_hex(r, g, b) {
    if (r < 0 || g < 0 || b < 0) return false;

    r = r <= 255 ? r : 255;
    g = g <= 255 ? g : 255;
    b = b <= 255 ? b : 255;

    var r_hex = r.toString(16).length === 1 ? '0' + r.toString(16) : r.toString(16);
    var g_hex = g.toString(16).length === 1 ? '0' + g.toString(16) : g.toString(16);
    var b_hex = b.toString(16).length === 1 ? '0' + b.toString(16) : b.toString(16);

    return ('#' + r_hex + g_hex + b_hex).toUpperCase();

}

function hex_to_rgb(hex) {

    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    }
}

/*
 *  get a color between min |---------------| max
 *  according to the percent given
 */
function get_color(percent, min, max) {
    if (0 > percent || percent > 100) return false;
    var rgb_min = hex_to_rgb(min);
    var rgb_max = hex_to_rgb(max);
    var p_normalized = percent / 100;

    return {

        r: Math.round(rgb_min.r * (1 - p_normalized) + rgb_max.r * p_normalized),
        g: Math.round(rgb_min.g * (1 - p_normalized) + rgb_max.g * p_normalized),
        b: Math.round(rgb_min.b * (1 - p_normalized) + rgb_max.b * p_normalized)
    };
}

// return true if the color option is selected more than one time.
function isColorSelectedMult(attributes_selected) {
  var selectedOnce = false;
  for (var i = attributes_selected.length - 1; i >= 0; i--) {
    if (attributes_selected[i].text === "color") {
      if (selectedOnce) return true;
      else selectedOnce = true;
    }
  }
  return false;
}
