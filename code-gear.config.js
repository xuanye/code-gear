module.exports = {
    database: {
        host: '127.0.0.1',
        port: 3306,
        database: 'sampleDb',
        user: 'root',
        password: '123333@',
    },
    template: {
        imports: './templates/imports.js',
        target: './.generate',
        templates: [
            {
                splitType: 1, // 1= table split每个table 一个文件 0 =所有的table 一个文件
                path: './templates/vulcanEntity.art', //相对的模板路劲
                targetFile: function (t) {
                    var arrParts = t.tableName.split('_');
                    var resArr = [];
                    resArr.push('./');
                    arrParts.forEach((a) => {
                        if (!a) {
                            return '';
                        }
                        var s = a.replace(
                            /\b(\w)(\w*)/g,
                            function ($0, $1, $2) {
                                return $1.toUpperCase() + $2.toLowerCase();
                            }
                        );
                        resArr.push(s);
                    });
                    resArr.push('.cs');
                    return resArr.join('');
                },
                extend: {
                    //额外的变量
                    nameSpace: 'Sample.Impl.Model',
                    baseModel: 'Sample.Impl.Model.BaseModel',
                },
            },
        ],
    },
};
