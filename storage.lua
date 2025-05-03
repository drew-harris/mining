---@diagnostic disable: need-check-nil
local function cPrint(msg)
	http.post("https://turtle.drewh.net/status", msg)
end

local args = { ... }

print("name is" .. args[1])

cPrint(textutils.serialiseJSON(peripheral.getNames()))

while true do
	local ws = http.websocket("wss://turtle.drewh.net/ws/" .. args[1])

	ws.send(textutils.serialiseJSON({ type = "opening", name = args[1], isTurtle = turtle ~= nil }))

	if ws == nil then
		print("no websocket")
	end

	while true do
		if ws == nil then
			return
		end

		local msg = ws.receive(2)
		if msg ~= nil then
			local obj = textutils.unserialiseJSON(msg)
			if obj.type == "eval" then
				local func = loadstring(obj["function"])
				local result = func()
				ws.send(textutils.serialiseJSON({ data = result }))
			else
				print("no")
			end
		end
	end
end
