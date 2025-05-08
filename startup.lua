---@diagnostic disable: need-check-nil
local function cPrint(msg)
	http.post("https://turtle.drewh.net/status", msg)
end

local args = { ... }

local file = fs.open("computer.txt", "r")
local name = file.readAll()
print("computer name is: " .. name)

cPrint(textutils.serialiseJSON(peripheral.getNames()))

-- Queue to store pending evaluations
local evalQueue = {}

local function suckItems()
	local names = peripheral.getNames()
	
	-- Find the barrel
	local barrelName = nil
	for _, name in pairs(names) do
		if peripheral.getType(name) == "barrel" or (name:find("minecraft:barrel")) then
			if barrelName then
				print("Error: More than one barrel found on the network!")
				return
			end
			barrelName = name
		end
	end

	if not barrelName then
		print("Error: No barrel found on the network!")
		return
	end

	local barrel = peripheral.wrap(barrelName)
	local items = barrel.list()
	
	-- For each item in the barrel
	for slot, item in pairs(items) do
		-- Try to move it to any available chest
		for _, name in pairs(names) do
			if (peripheral.getType(name) == "chest" or name:find("minecraft:chest")) and name ~= barrelName then
				local chest = peripheral.wrap(name)
				if chest then
					local moved = barrel.pushItems(name, slot)
					if moved > 0 then
						print("Moved " .. moved .. " " .. item.name .. " to " .. name)
						break
					end
				end
			end
		end
	end
end

-- Function to handle a single evaluation
local function handleEval(ws, obj)
	local func = loadstring(obj["function"])
	if func == nil then
		return
	end
	local funcArgs = obj["args"]
	if funcArgs == nil then
		funcArgs = {}
	end
	local ok, result = pcall(func, unpack(funcArgs))
	if not ok then
		return
	end
	ws.send(textutils.serialiseJSON({ data = result }))
end

-- Function to process the evaluation queue
local function processEvalQueue(ws)
	while true do
		if #evalQueue > 0 then
			local obj = table.remove(evalQueue, 1)
			handleEval(ws, obj)
		end
		os.sleep(0.1)
	end
end

-- Function to run the websocket receiver
local function runWebsocketReceiver(ws)
	while true do
		if ws == nil then
			return
		end

		local ok, msg = pcall(ws.receive, 2)
		if not ok then
			os.sleep(2)
			return
		end

		if msg ~= nil then
			local obj = textutils.unserialiseJSON(msg)
			if obj.type == "eval" then
				-- Add the evaluation to the queue
				table.insert(evalQueue, obj)
			end
		end
	end
end

-- Function to handle redstone events
local function runRedstoneMonitor()
	while true do
		os.pullEvent("redstone")
		if redstone.getInput("top") then  -- Change "top" to match your button's side
			cPrint("Button pressed!")
			print("Button pressed!")
			-- Add your button press logic here
			suckItems()
		end
	end
end

-- Main loop
while true do
	local ws = http.websocket("wss://turtle.drewh.net/ws/" .. name)
	ws.send(textutils.serialiseJSON({ type = "opening", name = name, isTurtle = turtle ~= nil }))

	-- Run the websocket receiver, queue processor, and redstone monitor in parallel
	parallel.waitForAny(
		function()
			runWebsocketReceiver(ws)
		end,
		function()
			processEvalQueue(ws)
		end,
		function()
			runRedstoneMonitor()
		end
	)
end
