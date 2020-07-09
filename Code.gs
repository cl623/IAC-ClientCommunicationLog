function doGet(e) {
  if (e.parameter && e.parameter['page'] == 'Form') {
   return HtmlService.createTemplateFromFile("Client Communication Form").evaluate().setTitle("Client Communication Form").setFaviconUrl('https://le-cdn.website-editor.net/890182a9e4384ae6930cd502f9f32152/dms3rep/multi/opt/IAC+FINAL+%7C+Large-480w.png');
  }
  else{
    return HtmlService.createTemplateFromFile("form").evaluate().setTitle("Client Communication Log").setFaviconUrl('https://le-cdn.website-editor.net/890182a9e4384ae6930cd502f9f32152/dms3rep/multi/opt/IAC+FINAL+%7C+Large-480w.png');
  }
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

//=========TEST FUNCTIONS===========

function clientSearch(){
  console.log("Searching for client...");
}

//==================================

function getUser(){
  var user = Session.getActiveUser().getEmail()
  return user;
}


function setTitle(name){
   title = name
}

function test(){
  Logger.log(getClientNameDbLog(131));
}

/*
 * Contains info to connect to database
 */      
function databaseConnect(){
  
  var Properties;
  var connection = PropertiesService.getScriptProperties().getProperties();
  
  return connection;
}
/*
 * Creates connection to database
 */
function connect(connection){
  var connection = connection
  var url = connection.url
  var user = connection.user
  var password = connection.password
  var conn = Jdbc.getCloudSqlConnection(url, user, password);
  return conn;
    
}
function getClientNameDbLog(staffId){
  var Properties = PropertiesService.getScriptProperties().getProperties();
  var whitelist = Properties.whitelist.split(',');
  var dbConnect = databaseConnect();
  var conn = connect(dbConnect);
  var stmt = conn.createStatement();  
   
  var whitelisted = false;
  for(var i= 0; i < whitelist.length; i++){
   if(getUser() == whitelist[i])
     whitelisted=true
  }
  if(!whitelisted)
    var query = "select distinct l.ClientId,concat(c.FirstName,' ',c.LastName) as Name from client c inner join communications_log l on c.ClientId=l.ClientId where l.StaffId="+staffId+" order by Name asc;";
  else
    var query = "select concat(FirstName,' ',LastName) as Name,ClientId from client order by Name asc;";
  var data = stmt.executeQuery(query);
  var numCol = data.getMetaData().getColumnCount();
  var arr = [];
  var obj = {};
  var time = new Date().getTime();
  while(data.next()){
    
   for( var x = 1; x < numCol+1; x++){
      var colName = data.getMetaData().getColumnName(x);
      obj[colName] = data.getString(x);      
   }
        
  arr.push(obj);
  obj = {};
  }
  var newTime = new Date().getTime() - time;   
  Logger.log(newTime); 
  if(conn.isClosed())
    Logger.log("Not Connected :(!");
  else
    Logger.log("Connected!");
    
  stmt.close();
  conn.close();
  if(conn.isClosed())
    Logger.log("Disconnected :(!");
  else
    Logger.log("Connected!");
  var json = JSON.stringify(arr);
  return json;
}

function getClientNameDbForm(){
  var dbConnect = databaseConnect();
  var conn = connect(dbConnect);
  var stmt = conn.createStatement();    
  var query = "select concat(FirstName,' ',LastName) as Name,ClientId from client order by Name asc;";
  var data = stmt.executeQuery(query);
  var numCol = data.getMetaData().getColumnCount();
  var arr = [];
  var obj = {};
    
  while(data.next()){
    
   for( var x = 1; x < numCol+1; x++){
      var colName = data.getMetaData().getColumnName(x);
      obj[colName] = data.getString(x);      
   }
            
  arr.push(obj);
  obj = {};
  }
  if(conn.isClosed())
    Logger.log("Not Connected :(!");
  else
    Logger.log("Connected!");
    
  stmt.close();
  conn.close();
  if(conn.isClosed())
    Logger.log("Disconnected :(!");
  else
    Logger.log("Connected!");
  var json = JSON.stringify(arr);
  return json;
}

function addCoomLog(data, time,staffId){
  try{
  var dbConnect = databaseConnect();
  var conn = connect(dbConnect);
  var stmt = conn.createStatement();
  var commId;
  var query = "insert into communications_log(ClientId,CommNote,CommType,DateOfComm,Timestamp,TimeOfComm,DurationOfComm,EntityContacted,ContactPersonName,DocumentReceived,StaffId) values('"+data['client']+"','"+data['communicationNotes']+"','"+data['communicationType']+"','"+data['dateOfCommunication']+"','"+time+"','"+data['timeOfCommunication']+"','"+data['durOfCommunication']+"','"+data['entityContacted']+"','"+data['contactName']+"','"+data['documentsReceived']+"',"+staffId+");";
  var exe = stmt.execute(query);
  var query = "select LAST_INSERT_ID();";
  var exe = stmt.executeQuery(query);
  var numCol = exe.getMetaData().getColumnCount();
  while(exe.next()){
    
    for( var x = 1; x < numCol+1; x++){
      var colName = exe.getMetaData().getColumnName(x);
      commId = exe.getString(x);      
    }
  }
  for(var i=0; i<data['documentsReceived'].length;i++){
    var query = "insert into document_received(CommunicationsLogId,DocumentName,ClientId) values("+commId+",'"+data['documentsReceived'][i]+"',"+data['client']+");";
    var exe = stmt.execute(query);
  }
  stmt.close();
  conn.close();
  return "Communication Log Submitted";
  }
  catch(e){
    return "Error Submitting, Please Try Again.\n\n If Error Persists Please Contact:\n jlaggui@innovativeautism.org\njlison@innovativeautism.org";
  }
}

function loadStaff(){
  var dbConnect = databaseConnect();
  var conn = connect(dbConnect);
  var stmt = conn.createStatement();
  var query = "select StaffId,IacEmail,concat(FirstName,' ',LastName) as Name from staff;";
  var data = stmt.executeQuery(query);
  var numCol = data.getMetaData().getColumnCount();
  var arr = [];
  var obj = {};
  while(data.next()){
    
    for( var x = 1; x < numCol+1; x++){
      var colName = data.getMetaData().getColumnName(x);
      obj[colName] = data.getString(x);      
    }
  arr.push(obj);
  obj = {};
  }
  stmt.close();
  conn.close();
  var json = JSON.stringify(arr);
  return json;
}

function loadLogs(clientId,staffId){
  var dbConnect = databaseConnect();
  var conn = connect(dbConnect);
  var stmt = conn.createStatement();
  if(clientId == 'All Clients')
    var query = "select l.Timestamp,concat(s.FirstName,' ',s.LastName) as StaffName,l.EntityContacted,l.ContactPersonName,l.CommType,date_format(l.DateOfComm,'%m/%e/%Y'),TIME_FORMAT(l.TimeOfComm,'%I%:%i %p'),time_to_sec(l.DurationOfComm) as DurationOfComm,l.CommNote,l.DocumentReceived from communications_log l inner join client c on l.ClientId=c.ClientId inner join staff s on l.StaffId=s.StaffId where l.StaffId ="+staffId+" order by l.DateOfComm DESC,l.TimeOfComm DESC;";
  else
    var query = "select l.Timestamp,concat(s.FirstName,' ',s.LastName) as StaffName,l.EntityContacted,l.ContactPersonName,l.CommType,date_format(l.DateOfComm,'%m/%e/%Y'),TIME_FORMAT(l.TimeOfComm,'%I%:%i %p'),time_to_sec(l.DurationOfComm) as DurationOfComm,l.CommNote,l.DocumentReceived from communications_log l inner join client c on l.ClientId=c.ClientId inner join staff s on l.StaffId=s.StaffId where l.ClientId ="+clientId+" order by l.DateOfComm DESC,l.TimeOfComm DESC;";
  var data = stmt.executeQuery(query);
  var numCol = data.getMetaData().getColumnCount();
  var arr = [];
  var obj = {};
  while(data.next()){
    
    for( var x = 1; x < numCol+1; x++){
      var colName = data.getMetaData().getColumnName(x);
      obj[colName] = data.getString(x);      
    }
  arr.push(obj);
  obj = {};
  }
  stmt.close();
  conn.close();
  var json = JSON.stringify(arr);
  return json;
}
