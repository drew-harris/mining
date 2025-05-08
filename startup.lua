---@diagnostic disable: need-check-nil
local function cPrint(msg)
	http.post("https://turtle.drewh.net/status", msg)
end

local args = { ... }

local file = fs.open("computer.txt", "r")
local name = file.readAll()
print("computer name is: " .. name)

cPrint(textutils.serialiseJSON(peripheral.getNames()))

while true do
	local ws = http.websocket("wss://turtle.drewh.net/ws/" .. name)

	ws.send(textutils.serialiseJSON({ type = "opening", name = name, isTurtle = turtle ~= nil }))

	while true do
		if ws == nil then
			return
		end

		local ok, msg = pcall(ws.receive, 2)
		if not ok then
			os.sleep(2)
			break
		end

		if msg ~= nil then
			local obj = textutils.unserialiseJSON(msg)
			if obj.type == "eval" then
				local func = loadstring(obj["function"])
				if func == nil then
					break
				end
				local funcArgs = obj["args"]
				print("Args: " .. textutils.serialiseJSON(funcArgs))
				if funcArgs == nil then
					funcArgs = {}
				end
				local ok, result = pcall(func, unpack(funcArgs))
				if not ok then
					break
				end
				ws.send(textutils.serialiseJSON({ data = result }))
			end
		end
	end
end
