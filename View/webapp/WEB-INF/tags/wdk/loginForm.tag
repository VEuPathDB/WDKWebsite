<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="showError"/>
  <jsp:directive.attribute name="showCancel"/>

  <form name="loginForm" method="post" action="${pageContext.request.contextPath}/processLogin.do">
    <imp:loginFormFields showError="${showError}" showCancel="${showCancel}"/>
  </form>

</jsp:root>
