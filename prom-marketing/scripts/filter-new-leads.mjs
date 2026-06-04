#!/usr/bin/env node
import fs from "node:fs";

const parsed = JSON.parse(fs.readFileSync("C:/Users/User/AppData/Local/Temp/leads-import/parsed-leads.json", "utf8"));

// Hardcoded existing emails/phones from CRM query
const existingEmails = new Set([
  "nikolaivanchev1993@gmail.com","rozahartung123@gmail.com","ivankagk14@gmail.com","g.pasev@p-group.eu",
  "test-form-claude@promarketing.pw","mchelestinov@gmail.com","dimo.zanzov@hotmail.com","kimapsit@gmail.com",
  "stanislavamihaylova@abv.bg","koichogrudev53@gmail.com","filmi2filmi22@gmail.com","taniakurteakurteva1kurteva1@gmail.com",
  "esahakyan7171@gmail.com","stephanjohnson221@gmail.com","enchevjulien0@gmail.com","lilov433@gmail.com",
  "ivanpetrov03579@gmail.com","stasi_milkov2002@abv.bg","petar1942pnp@abv.bg","ancebeikova@gmail.com",
  "ivailopetev38@gmail.com","violetakoleva48@gmail.com","ivanivanov181267@gmail.com","mitkopetkov53@gmail.com",
  "biljanavelkovska28@gmail.com","sokolovmomcil9@gmail.com","petya.licheva2002@gmail.com","atanasov@atanasovclima.bg",
  "angelovanton31@gmail.com","ivaylo.lyutov@gmail.com","viktor.stoimenov1@abv.bg","radka_andreeva7@abv.bg",
  "sevolhatice56@gmail.com","emovenchev@gmail.com","mutafovyordan@gmail.com","gospodintonchev329@gmail.com",
  "ldurchev55@gmail.com","todnik45@gmail.com","deico2u@gmail.com","z.razpopova@gmail.com","gospodindinev126@gmail.com",
  "sales@solartechnology.bg","dancho_danov@abv.bg","burgasenergia@gmail.com","order@tasteofbulgaria.net",
  "kumanova1944@gmail.com","stefanstefanov5725@gmail.com","pgoranov2233@gmail.com","ydimitrova573@gmail.com",
  "v.chingarova@kmkn.eu","office.yotova@gmail.com","velinmanahov123@gmail.com","stockmodelsbg@gmail.com",
  "tatiana_spiridonova@abv.bg","ivo_petev@abv.bg","vesaka1986@abv.bg","zarko22031955@gmail.com",
  "ivnachevapz@gmail.com","dora1940dn@gmail.com","office@goldenkeybg.com","lozevteodor@gmail.com",
  "dima1966ninova@gmail.com","sabimanov72@gmail.com","boikotaskov58@gmail.com","marspirp@gmaibl.com",
  "antoan09@abv.bg","damian621213@gmail.com","verginia044@gmail.com","yordanovayordanka11@gmail.com",
  "dj_dido_rai@mail.bg","tehnovent@abv.bg","plamen@plasico.com","xasirosi.eu@gmail.com","office@synergyconsult.eu",
  "dimitarpenkov99@gmail.com","renicvetanova62@gmail.com","valiogotinito123@gmail.com","savka.shirteva@gmail.com",
  "georgievr711@gmail.com","veselinkachalakova@gmail.com","krasistoeva@web.de","computer_engineer44@yahoo.com",
  "mitko_vg@abv.bg","alexran49@gmail.com","vedaimoti@gmail.com","stefka7378@gmail.com","yordanhristov1234@gmail.com",
  "martin.richmart@gmail.com","borisovalilia646@gmail.com","malin_stepanov@abv.bg","mitkoneychev00@gmail.com",
  "penivi@abv.bg","diana.89@abv.bg","k17033779@gmail.com","z.mekereva@abv.bg","bistradukovska052@gmail.com",
  "borisstoylov99@gmail.com","karpacev2248@gmail.com","nurihasansabri@gmail.com","milkostefanov81@gmail.com",
  "petrovxristian77@gmail.com","marspirp@gmail.com","ivelina.nik@abv.bg","karamet77777@gmail.com",
]);

const existingPhones = new Set([
  "+359889998870","+359895048556","+359876166034","089 350 6316","+359 888 000 999","+359899914892","+359888745277",
  "+359888363002","+359886917523","+359889222281","+359876033343","+359879209747","+359889209033","+359896304622",
  "+359878960624","+359899145962","+359877550977","+359876758905","+359892798956","+359877399963","+359878616080",
  "+3598998086970899808697","+359876984252","+38971426977","359896707636","+359878757911","+359897330101",
  "+359894069096","+359896729525","+359888444174","+359885320948","+436764524805","+359 89 4242225","+359885852674",
  "+359884076254","+359876666099","+359885034200","+359877785698","+359888380885","+359888323978","+359886533355",
  "+359886508084","+359878766005","+359877995822","+359884066697","+359877013288","+359895800143","+359888287437",
  "0878847675","+359876181880","+359894244592","+359894385553","+359884666008","+359884563111","+359887323099",
  "+359887212011","+359878505825","+359882442295","+359888200943","+359887945554","+359882103899","+359888442747",
  "+359889812180","+359886875971","+359885328615","+359879208497","+359899421660","+359888788279","+359886087821",
  "+359897978877","+359892323586","+359884164904","+359899245290","+359876515502","+359896321112","+359889873316",
  "+359893515198","+359895242701","+359889206096","+359898786353","+359888493918","+359886961484","+359877290541",
  "+359877720688","+359886346218","+359878405199","0879612705","+359877647891","+359887666956","+359876287242",
  "+359879249987","+359877959300","+359876423758","+359896382381","+359885650577","+359885944410","+359882277827",
]);

const newLeads = parsed.filter((l) => {
  if (l.email && existingEmails.has(l.email)) return false;
  if (l.phone && existingPhones.has(l.phone)) return false;
  return true;
});

console.log(`Total parsed: ${parsed.length}`);
console.log(`Already in CRM: ${parsed.length - newLeads.length}`);
console.log(`NEW to import: ${newLeads.length}\n`);

// Generate SQL VALUES
const sqlValues = newLeads.map((l) => {
  const fullName = (l.full_name || l.email || "Lead").replace(/'/g, "''");
  const email = l.email ? `'${l.email.replace(/'/g, "''")}'` : "NULL";
  const phone = l.phone ? `'${l.phone.replace(/'/g, "''")}'` : "NULL";
  const notes = `[Bulk import 28.05] Campaign: ${l.campaign_name || "n/a"} | Ad: ${l.ad_name || "n/a"} | Form: ${l.form_name || "n/a"} | Platform: ${l.platform || "n/a"} | Meta ID: ${l.id || "n/a"} | Created: ${l.created_time || "n/a"}`.replace(/'/g, "''");
  const createdAt = l.created_time ? `'${new Date(l.created_time).toISOString()}'` : "NOW()";
  return `('${fullName}', ${email}, ${phone}, 'lead', 'meta_lead', '${notes}', ${createdAt}, NOW())`;
});

const sql = `INSERT INTO contacts (full_name, email, phone, stage, source, notes, created_at, updated_at) VALUES\n${sqlValues.join(",\n")};`;

fs.writeFileSync("C:/Users/User/AppData/Local/Temp/leads-import/insert.sql", sql);
console.log(`SQL written to C:/Users/User/AppData/Local/Temp/leads-import/insert.sql (${sql.length} chars)`);
console.log(`\nSample new leads:`);
newLeads.slice(0, 10).forEach((l, i) => console.log(`  ${i+1}. ${l.full_name} · ${l.email} · ${l.phone}`));
