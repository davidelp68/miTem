const mitem = require('./mitem');

test("Set variable", function () {
    let template = mitem.compile("hello {{who}}");
    expect(template({who: "world!"})).toBe("hello world!");
    expect(template({who: "me"})).toBe("hello me");

    template = mitem.compile("hello {{ who }}");
    expect(template({who: "world!"})).toBe("hello world!");
    expect(template({who: "me"})).toBe("hello me");
});

test("Complex variable", function () {
    let template = mitem.compile("hello {{person.name}}");
    expect(template({person: {name:"Alex"}})).toBe("hello Alex");
    expect(template({person: {}})).toBe("hello undefined");
});


test("Set multiple variables", function () {
    let template = mitem.compile("{{hi}} {{ who }}");
    expect(template({who: "me", hi:"hello"})).toBe("hello me");

    template = mitem.compile("{{who }} {{hi}} {{ who }}");
    expect(template({who: "me", hi:"hello"})).toBe("me hello me");
});

test("If statement", function () {
    let template = mitem.compile("{% if condition %} test {% endif %}");
    expect(template({condition: false})).toBe("");
    expect(template({condition: true})).toBe(" test ");

    template = mitem.compile("qw {% if condition %} test {% endif %}er");
    expect(template({condition: false})).toBe("qw er");

    template = mitem.compile("qw {% if condition %} test {% endif %}er");
    expect(template({condition: true})).toBe("qw  test er");

    template = mitem.compile("{% if cond1 %} test1 {% endif %}{% if cond2 %} test2 {% endif %}");
    expect(template({cond2: true,cond1:false})).toBe(" test2 ");
});

test("If else statement", function () {
    let template = mitem.compile("{% if cond %} test1 {% else %} test2 {% endif %}");
    expect(template({cond: true})).toBe(" test1 ");
    expect(template({cond: false})).toBe(" test2 ");

    template = mitem.compile("{% if cond1 %}t1{% else if cond2 %}t2{%else%}t3{% endif %}");
    expect(template({cond1: true,cond2: true})).toBe("t1");
    expect(template({cond1: false,cond2: true})).toBe("t2");
    expect(template({cond1: true,cond2: false})).toBe("t1");
    expect(template({cond1: false,cond2: false})).toBe("t3");

    template = mitem.compile("{% if cond %} {{var}} {% endif %}");
    expect(template({cond: true,var: "asd"})).toBe(" asd ");
});

test("Expression with statement", function () {
    let template = mitem.compile("{{text}}");
    expect(template({text: "{% if cond %} test1 {% else %} test2 {% endif %}"}))
        .toBe("{% if cond %} test1 {% else %} test2 {% endif %}");
});

test("Multiline template", function () {
    let template = mitem.compile(`hello {{who}}
hello {{who}}
hello {{who}}
hello {{who}}
hello {{who}}
`);
    expect(template({who: "world!"})).toBe(`hello world!
hello world!
hello world!
hello world!
hello world!
`);

});

test("Filter default", function () {
    let template = mitem.compile("hello {{who|default('Value not set')}}");
    expect(template({})).toBe("hello Value not set");

    template = mitem.compile("hello {{who|default('Value not set')}}");
    expect(template({who:"value"})).toBe("hello value");
});

test("String function as filter", function () {
    let template = mitem.compile("hello {{who|repeat(2)}}");
    expect(template({who:"value"})).toBe("hello valuevalue");
});

test("Array function as filter", function () {
    let template = mitem.compile("hello {{who|join(',')}}");
    expect(template({who:["qw", "er"]})).toBe("hello qw,er");
});

test("Several filters", function () {
    let template = mitem.compile("hello {{who|join(',')|repeat(2)}}");
    expect(template({who:["qw", "er"]})).toBe("hello qw,erqw,er");

    template = mitem.compile("{{ arr | join(',') | toUpperCase }}");
    expect(template({arr:["qw", "er"]})).toBe("QW,ER");
});

test("Filter is not exists", function () {
    let outputData = "";
    let storeLog = inputs => (outputData += inputs);
    console["error"] = jest.fn(storeLog);

    let template = mitem.compile("hello {{who|qwe}}");
    expect(()=>{template({who:["qw", "er"]})}).toThrowError("c.who.qwe is not a function");
    expect(outputData).toBe("Line: 1; Error in {{who|qwe}}");


    outputData = "";
    template = mitem.compile("hello {{who|qwe(5)}}");
    expect(()=>{template({who:["qw", "er"]})}).toThrowError("c.who.qwe is not a function");
    expect(outputData).toBe("Line: 1; Error in {{who|qwe(5)}}");
});

test("For statement (array)", function () {
    let template = mitem.compile("{% for item in arr %}test{% endfor %}");
    expect(template({arr: []})).toBe("");
    expect(template({arr: [1]})).toBe("test");
    expect(template({arr: [1,2]})).toBe("testtest");
});

test("For statement (object)", function () {
    let template = mitem.compile("{% for item in arr %}test{% endfor %}");
    expect(template({arr: {} })).toBe("");
    expect(template({arr: {a:1} })).toBe("test");
    expect(template({arr: {a:1,b:2} })).toBe("testtest");
});

test("For statement with variable", function () {
    let template = mitem.compile("{% for item in arr %}{{item.foo}}{% endfor %}");
    expect(template({arr: [] })).toBe("");
    expect(template({arr: [{foo:"test"}]})).toBe("test");
    expect(template({arr: [{foo:"test "}, {foo:"test2"}]})).toBe("test test2");
});

test("For statement loop index", function () {
    let template = mitem.compile("{% for item in arr %}{{loop.index}}{% endfor %}");
    expect(template({arr: [{foo:"test "}, {foo:"test2"}]})).toBe("12");

    template = mitem.compile("{% for item in arr %}{{loop.index0}}{% endfor %}");
    expect(template({arr: [{foo:"test "}, {foo:"test2"}]})).toBe("01");

    template = mitem.compile("{% for item in arr %}{{loop.index}}{% endfor %}");
    expect(template({arr: {x:{foo:"test "}, y:{foo:"test2"}}})).toBe("12");

    template = mitem.compile("{% for item in arr %}{{loop.index0}}{% endfor %}");
    expect(template({arr: {x:{foo:"test "}, y:{foo:"test2"}}})).toBe("01");
});

test("For statement loop length", function () {
    let template = mitem.compile("{% for item in arr %}{{loop.length}} {% endfor %}");
    expect(template({arr: [{foo:"test"}]})).toBe("1 ");
    expect(template({arr: [{foo:"test "}, {foo:"test2"}]})).toBe("2 2 ");

    expect(template({arr: {a:{foo:"test"}}})).toBe("1 ");
    expect(template({arr: {a:{foo:"test "}, b:{foo:"test2"}}})).toBe("2 2 ");
});

test("For statement loop first element", function () {
    let template = mitem.compile("{% for item in arr %}{% if loop.first %}first{%else%} not first{%endif%}{% endfor %}");
    expect(template({arr: [{foo: "test"}]})).toBe("first");
    expect(template({arr: [{foo: "test "}, {foo: "test2"}]})).toBe("first not first");
    expect(template({arr: [1,2,3]})).toBe("first not first not first");
});

test("For statement loop last element", function () {
    let template = mitem.compile("{% for item in arr %}{% if loop.last %}last{%else%}not last {%endif%}{% endfor %}");
    expect(template({arr: [{foo: "test"}]})).toBe("last");
    expect(template({arr: [{foo: "test "}, {foo: "test2"}]})).toBe("not last last");
    expect(template({arr: [1,2,3]})).toBe("not last not last last");
});

test("For statement parent context", function () {
    let template = mitem.compile("{% for item in arr %}{{item.foo}} {{loop.parent.bar}}{% endfor %}");
    expect(template({arr: [{foo: "test"}], bar: "b"})).toBe("test b");
});

test("Nested for statement", function () {
    let template = mitem.compile(
        "{% for item in arr %}{{item.foo}} {{loop.parent.bar}} " +
        "{% for item2 in item.n_arr %}{{item2}} {{loop.parent.item.foo}} {% endfor %}" +
        "{% endfor %}");
    expect(template({arr: [{foo: "test", n_arr:[4,6]}], bar: "b"})).toBe("test b 4 test 6 test ");
});