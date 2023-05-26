# JQ-Ajax-2-Axios README

as the name meaning, it can transform your `$.ajax({})` block into `try catch + axios` block;

## how to use

**before transform, you must select the block which you want to transform**

1. key down F1 and input `transform`, select the one connect to this plugin;
2. shortcut `ctrl + shift + q` in `windows` while `cmd + shift + q` in `Mac`;
3. (recommend), use editor `menus`, and find the command.

## config

**jq_ajax_2_axios.config**
- `axios_path`: your axios path, cause it is hard to know your axios path.
- `reg_str`: an nest array which elements contains an `reg rule` and replace `target`, make sure your regexp is correct.
- `axios_alias`: your axios's name, you can all rename: `this.$axios` which meaning use your global axios from instance.


- example:
open your user settings.json, and copy it into the json
```json
      "jq_ajax_2_axios.config": {
        "axios_path": "import { axios } from '@/apis/request'",
        "reg_str": [[".*?\\$.parseJSON(.*?);", ""]],
        "axios_alias": "this.$axios"
    }
```

## note
1. note that if you have both fail() and error()，and this two function has params, you need to handly transform some code where use the params cause the fail() and error() function are transform together into the catch block.


## example
![example](https://raw.githubusercontent.com/1714080902120/jq-ajax-2-axios/main/src/image/transform_demo.gif)


**Enjoy!**
