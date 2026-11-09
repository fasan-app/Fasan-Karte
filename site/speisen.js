'use strict';
/* Fasan Karte – Was war dieser Posten? MPL-2.0
 * Ordnet Bon-Namen („Abatanado Descaf“, „Pedras 25 cl“, „Bica“) einem deutschen Klarnamen mit Symbol zu, damit man
 * später weiß, was es war, auch wenn man den Namen auf dem Bon nicht mehr kennt (Wiedererkennen statt Erinnern).
 * Eigenes Wörterbuch (DE, EN, PT, ES, FR, IT, NL), kein Netz, keine KI. Unscharfer Abgleich gegen Lesefehler der Erkennung:
 * Wörter ab 5 Buchstaben dürfen 1 Zeichen abweichen, ab 8 Buchstaben 2. Mehrwort-Begriffe gehen vor Einzelwörtern.
 * Unbekanntes bleibt unbekannt: lieber kein Klarname als ein falscher.
 * Zeilenformat: Symbol|Klarname|Begriffe (Komma). Marken nur, wo sie eindeutig ein Produkt meinen (Pedras = Sprudel).
 */
window.Speisen = (() => {
  const LISTE = `
☕|Espresso|espresso,expresso,bica,cafezinho,cafe solo,cafe curto,ristretto,cafe serre,kurzer
☕|Kaffee|cafe,coffee,kaffee,koffie,caffe,abatanado,americano,cafe americano,cafe longo,cafe cheio,filterkaffee,tinto,cafe allonge,lungo,cafe crema
☕|Milchkaffee|galao,meia de leite,cafe com leite,cafe con leche,cafe au lait,cafe creme,milchkaffee,latte,caffe latte,latte macchiato,flat white,cortado,pingado,garoto,koffie verkeerd
☕|Cappuccino|cappuccino,cappucino,capuccino,capucino,cappuchino
☕|Espresso mit Milchschaum|macchiato,caffe macchiato,noisette
🫖|Tee|tee,tea,cha,the,te,infusao,infusion,tisane,chai,earl grey,kamille,camomila,pfefferminztee,menta,hortela
🥛|Heiße Schokolade|chocolate quente,hot chocolate,kakao,cacao,chocolat chaud,cioccolata,chocolate caliente,warme chocolademelk
🥛|Milch|leite,milk,milch,vollmilch,h-milch,lait,latte freddo,leche
💧|Wasser|agua,water,wasser,eau,acqua,mineralwasser,agua mineral,eau minerale,acqua minerale,luso,vitalis,evian,volvic
💧|Wasser mit Kohlensäure|agua com gas,agua con gas,sparkling water,sprudel,eau gazeuse,acqua frizzante,frizzante,pedras,pedras salgadas,san pellegrino,perrier,vimeiro,castello,gazeuse,spa rood
💧|Stilles Wasser|agua sem gas,agua sin gas,still water,stilles wasser,eau plate,acqua naturale,naturale,spa blauw
🥤|Cola|cola,coca-cola,coca cola,coke,pepsi,cola zero,coca zero,coke zero,pepsi max
🥤|Limonade oder Schorle|limonada,lemonade,limonade,fanta,sprite,7up,seven up,sumol,laranjada,gasosa,schweppes,ginger ale,tonica,tonic,fruchtschorle,schorle,apfelschorle,spezi,mezzo mix,bitter lemon,ice tea,iced tea,ice-tea,lipton,nestea,cha gelado
🥤|Energydrink|energy,energydrink,energy drink,red bull,redbull,monster,rockstar,koffein,booster,mate,club-mate,clubmate
🥤|Sportgetränk|iso,isotonic,isoton,isostar,powerade,gatorade,iso drink,elektrolyt
🧃|Saft|lassi,smoothie,nektar,nectar,sumo,sumo natural,juice,saft,jus,succo,zumo,zumo natural,orangensaft,sumo de laranja,orange juice,apfelsaft,jus d orange,spremuta
🍺|Bier|cerveja,beer,bier,biere,birra,cerveza,imperial,fino,tulipa,caneca,pint,pils,pilsner,weizen,weizenbier,hefeweizen,helles,radler,super bock,sagres,heineken,estrella,peroni,kronenbourg,stella,guinness,lager,ipa,cana,cervesa,bock,draft,tap
🍷|Wein|vinho,wine,wein,vin,vino,vinho tinto,vinho branco,red wine,white wine,rotwein,weisswein,vin rouge,vin blanc,vino rosso,vino blanco,rose,vinho verde,alvarinho,douro,rioja,chianti,prosecco,cava,sekt,champagne,espumante,sangria,tinto de verano,jarra,copo de vinho,glas wein,taca
🍷|Portwein|porto,port wine,portwein,vinho do porto,tawny,ruby,moscatel,madeira
🍸|Cocktail|cocktail,mojito,caipirinha,caipiroska,margarita,daiquiri,pina colada,spritz,aperol,aperol spritz,hugo,negroni,cosmopolitan,mai tai,long island,sex on the beach,martini,porto tonico
🍸|Gin Tonic|gin tonic,gin tonico,gin and tonic,gin-tonic,gin
🥃|Spirituose|whisky,whiskey,vodka,wodka,rum,ron,tequila,brandy,cognac,aguardente,medronho,ginjinha,ginja,licor,liqueur,likor,grappa,limoncello,amaretto,ouzo,schnaps,sambuca,baileys,jagermeister,shot
🥛|Milchprodukt|creme fraiche,schmand,sahne,schlagsahne,saure sahne,quark,magerquark,joghurt,jogurt,yoghurt,yogurt,frischkase,frischkaese,mascarpone,ricotta,skyr,kefir,buttermilch,iogurte,natas
🥐|Gebäck|pastel de nata,pasteis de nata,nata,pastel,croissant,brioche,pain au chocolat,cornetto,bola de berlim,berliner,donut,muffin,queque,bolo,cake,kuchen,tarte,tarta,torta,tart,strudel,brezel,pretzel,laugenbrezel,bretzel,scone,waffel,waffle,gaufre,crepe,crepes,palmier,travesseiro,queijada,pao de deus,croissant misto
🍞|Brot|pao,bread,brot,pain,pane,pan,broetchen,brotchen,baguette,tosta,toast,torrada,tostada,bruschetta,couvert,coperto,pao com manteiga,manteiga,butter,beurre,mantequilla
🫒|Oliven|azeitonas,olives,oliven,aceitunas,olive
🥪|Sandwich|sandes,sandwich,sanduiche,bocadillo,panino,panini,tramezzino,croque-monsieur,croque monsieur,croque madame,tosta mista,bifana,prego,belegtes brot,wrap,club sandwich,toastie,francesinha,bauru
🍔|Burger|burger,hamburguer,hamburger,cheeseburger,hamburguesa,veggie burger
🍕|Pizza|pizza,margherita,margarita pizza,calzone,focaccia
🍝|Pasta|pasta,massa,esparguete,spaghetti,espagueti,penne,lasagne,lasanha,lasagna,tagliatelle,fettuccine,ravioli,gnocchi,carbonara,bolognese,linguine,risotto,macarrao,nudeln,spatzle,kasespatzle,maultaschen
🍟|Pommes|batata frita,batatas fritas,fries,french fries,pommes,frites,patatas fritas,patatas bravas,chips,patatine
🥗|Salat|salada,salad,salat,salade,ensalada,insalata,caesar,caprese,salada mista,salada verde,bowl
🍲|Suppe|sopa,soup,suppe,soupe,zuppa,caldo verde,canja,creme de legumes,gazpacho,minestrone,consomme,eintopf
🐟|Fisch|peixe,fish,fisch,poisson,pesce,pescado,bacalhau,bacalao,dorada,dourada,robalo,sea bass,salmao,salmon,lachs,saumon,salmone,atum,tuna,thunfisch,thon,tonno,atun,sardinhas,sardinas,sardines,sardinen,polvo,octopus,pulpo,lula,lulas,squid,calamares,calamari,choco,choco frito,carapau,espadarte,linguado,pescada,frango do mar,fish and chips,ceviche,sushi,sashimi,peixe grelhado
🦐|Meeresfrüchte|marisco,mariscos,seafood,meeresfruchte,fruits de mer,frutti di mare,camarao,camaroes,gambas,shrimp,prawns,garnelen,crevettes,ameijoas,clams,muscheln,mexilhao,mussels,moules,cozze,ostras,oysters,austern,lagosta,lobster,arroz de marisco,paella,amejoas a bulhao pato,cataplana,sapateira,percebes
🥩|Fleisch|carne,meat,fleisch,viande,bife,bitoque,steak,entrecote,picanha,porco,pork,schwein,porc,maiale,cerdo,secretos,plumas,vitela,veal,kalb,vaca,beef,rind,boeuf,manzo,cordeiro,lamb,lamm,agneau,cabrito,schnitzel,wiener schnitzel,cordon bleu,costeleta,costelas,ribs,spare ribs,leitao,frikadelle,cozido,alheira,chourico,chorizo,salsicha,wurst,bratwurst,currywurst,kebab,doner,feijoada,carne de porco a alentejana,espetada,gulasch
🍗|Hähnchen|frango,chicken,hahnchen,huhn,poulet,pollo,frango assado,frango piri piri,piri piri,peito de frango,nuggets,wings,chicken wings,brathahnchen,pato,duck,ente,canard
🥚|Ei|ovo,ovos,egg,eggs,ei,eier,oeuf,omelete,omelette,omelet,tortilla,spiegelei,ruhrei,scrambled eggs,benedict
🧀|Käse|queijo,cheese,kase,fromage,formaggio,queso,tabua de queijos,mozzarella,burrata,parmesan,feta,brie,camembert
🥓|Wurst und Schinken|presunto,ham,schinken,jambon,prosciutto,jamon,charcutaria,charcuterie,tabua mista,enchidos,salame,salami,chourico assado
🥘|Hauptgericht|prato do dia,menu do dia,dish of the day,tagesgericht,plat du jour,piatto del giorno,menu del dia,menu,menue,arroz,rice,reis,riz,risotto,curry,tapas,petiscos,meze,degustacao,tasting
🥦|Gemüse|legumes,vegetables,gemuse,legumes grelhados,verduras,verdure,espinafres,brocolos,cogumelos,mushrooms,pilze,champignons,setas,funghi,batata,potatoes,kartoffeln,pommes de terre,pure,mash,vegetariano,vegetarian,vegan,tofu,falafel,hummus,grao,lentilhas
🍰|Nachtisch|apple pie,pie,sobremesa,dessert,nachtisch,nachspeise,postre,dolce,doce,tiramisu,mousse,mousse de chocolate,pudim,pudding,flan,creme brulee,leite creme,arroz doce,panna cotta,cheesecake,brownie,salame de chocolate,baba de camelo,serradura,crema catalana,apfelstrudel,kaiserschmarrn,profiteroles,fondant
🍨|Eis|gelado,ice cream,eis,glace,gelato,helado,sorvete,sorbet,sundae,eisbecher,milkshake,batido,frappe
🍎|Obst|fruta,fruit,obst,frucht,fruits,frutta,fruta da epoca,macedonia,salada de fruta,ananas,banana,banane,laranja,orange,maca,apple,apfel,melao,melon,morangos,strawberries,erdbeeren,mango,manga,maracuja,passionsfrucht,kiwi,birne,pear,pera,trauben,uvas,grapes,kirschen,cerejas,cherries,pfirsich,pessego,peach,grapefruit,toranja,heidelbeeren,blueberries,himbeeren,framboesas,pflaume,ameixa,aprikose,damasco,wassermelone,melancia,papaya,papaia
🍬|Süßes|chocolate,schokolade,chocolat,cioccolato,bolacha,cookie,cookies,keks,biscuit,biscotti,gomas,candy,bonbon,snack,croquete,croquetes,rissol,rissois,pastel de bacalhau,bolinho de bacalhau,empada,coxinha,samosa,empanada
⛽|Tanken|diesel,gasoleo,gasolina,benzin,super e10,e10,super 95,super 98,sp95,sp98,adblue,gpl,lpg,autogas
🎟️|Eintritt|bilhete,entrada,eintritt,admission,ingresso,eintrittskarte,museu,museum
🚕|Fahrt|taxi,uber,bolt,fahrt,viagem,portagem,maut,estacionamento,parken,parking,parkhaus
🛍️|Pfand und Tüte|pfand,leergut,deposit,tara,saco,sacola,bag,tute,tragetasche,sac
💶|Service|servico,service,bedienung,servizio,taxa de servico,gorjeta,trinkgeld,tip,pourboire,propina,coperto
`;
  const ZUSATZ = [
    ['koffeinfrei', 'descafeinado,descaf,decaf,deca,decaffeinato,koffeinfrei,sans cafeine,descafeinado,entkoffeiniert,cafeinevrij'],
    ['doppelt', 'duplo,doble,double,doppio,doppelt,dubbel,grande'],
    ['groß', 'grande,large,gross,big,xl,caneca,maxi'],
    ['klein', 'pequeno,small,klein,petit,piccolo,mini,curto'],
    ['vegetarisch', 'vegetariano,vegetarian,vegetarisch,veggie,vegetarien'],
    ['vegan', 'vegan,vegano,vegane,vegetal'],
    ['ohne Zucker', 'zero,sem acucar,sugar free,sin azucar,light,diet,ohne zucker'],
    ['mit Eis', 'com gelo,with ice,con hielo,mit eis,on the rocks'],
  ];
  const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9ß ]+/g, ' ').replace(/\b\d+([.,]\d+)?\s*(cl|ml|l|lt|g|kg|gr|oz|un|uni|x)\b/g, ' ').replace(/\b\d+\b/g, ' ').replace(/\s+/g, ' ').trim();
  const eintraege = [];
  for (const z of LISTE.trim().split('\n')) {
    const [s, n, k] = z.split('|'); if (!k) continue;
    for (const b of k.split(',')) { const w = norm(b); if (w) eintraege.push({ s, n, w, teile: w.split(' '), o: eintraege.length }); }
  }
  // Vorrang: mehr Wörter, dann Reihenfolge der Liste (Getränke und Gerichte vor Zutaten wie Obst oder Käse)
  eintraege.sort((a, b) => b.teile.length - a.teile.length || a.o - b.o);
  const zusatz = ZUSATZ.map(([n, k]) => ({ n, w: k.split(',').map(norm).filter(Boolean) }));

  function abstand(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let vor = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const akt = [i]; let min = i;
      for (let j = 1; j <= b.length; j++) { akt[j] = Math.min(vor[j] + 1, akt[j - 1] + 1, vor[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (akt[j] < min) min = akt[j]; }
      if (min > max) return max + 1; vor = akt;
    }
    return vor[b.length];
  }
  const erlaubt = (w) => (w.length >= 8 ? 2 : w.length >= 5 ? 1 : 0);
  const gleich = (a, b) => a === b || (Math.min(a.length, b.length) >= 5 && abstand(a, b, Math.min(erlaubt(a), erlaubt(b))) <= Math.min(erlaubt(a), erlaubt(b)));
  // Begriff (ein oder mehrere Wörter) in der Wortfolge suchen; liefert Startstelle oder −1
  function finde(woerter, teile, genau) {
    for (let i = 0; i + teile.length <= woerter.length; i++) {
      let ok = true; for (let k = 0; k < teile.length && ok; k++) ok = genau ? woerter[i + k] === teile[k] : gleich(woerter[i + k], teile[k]);
      if (ok) return i;
    }
    return -1;
  }
  // Ergebnis: { s: Symbol, n: Klarname (mit Zusätzen), grund: gefundener Begriff } oder null
  // art: Bon-Art aus bon.js (z. B. 'supermarkt'): im Einkauf sind „Kaffee 500 g“ oder „Milch 1 l“ Packungen, keine Getränke am Tisch
  function erkenne(text, art) {
    const r = erkenne1(text, art); if (r || !/ae|oe|ue/i.test(String(text || ''))) return r;
    // Kassen ohne Umlaute schreiben KAESE, GRUENE, SOSSE: zweiter Versuch mit ä/ö/ü (nur wenn der erste nichts fand – „queijo“ bleibt)
    return erkenne1(String(text).replace(/ae/gi, 'ä').replace(/oe/gi, 'ö').replace(/ue/gi, 'ü'), art);
  }
  function erkenne1(text, art) {
    const woerter = norm(text).split(' ').filter(Boolean); if (!woerter.length) return null;
    let treffer = null;
    // erst genaue Treffer, dann unscharfe (Lesefehler)
    for (const genau of [true, false]) { for (const e of eintraege) { const i = finde(woerter, e.teile, genau); if (i >= 0) { treffer = { ...e, i }; break; } } if (treffer) break; }
    const zus = [];
    for (const z of zusatz) if (z.w.some((w) => finde(woerter, w.split(' ')) >= 0) && !(treffer && treffer.n.toLowerCase().includes(z.n.toLowerCase()))) zus.push(z.n);
    if (!treffer) return null;
    // „Kaffee“ + „koffeinfrei“ → „Kaffee, koffeinfrei“; „Wasser mit Kohlensäure“ bleibt ohne „groß“ usw. nur wenn passend
    const n = treffer.n + (zus.length ? ', ' + zus.filter((z, i, a) => a.indexOf(z) === i).slice(0, 2).join(', ') : '');
    const packung = art === 'supermarkt' && /\d\s*(g|kg|ml|cl|l|lt)\b/i.test(String(text)) && !/Pfand/.test(n) ? ', Packung' : '';
    return { s: treffer.s, n: n + packung, grund: treffer.w };
  }
  return { erkenne, norm };
})();
