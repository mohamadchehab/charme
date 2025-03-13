'use server';

import { generateId } from 'ai';
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { OpenAI } from 'openai';
import { ReactNode } from 'react';
import { Message } from './message';
import getWeather from '@/tools/fetchWeather';
import { readGmailMessages } from '@/tools/readMails';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClientMessage {
  id: string;
  status: ReactNode;
  text: ReactNode;
  gui: ReactNode;
}

const ASSISTANT_ID = 'asst_zbPraVgG56MEKAyhCej0hbdp';
let THREAD_ID = '';
let RUN_ID = '';

export async function submitMessage(question: string): Promise<ClientMessage> {
  const status = createStreamableUI('thread.init');
  const textStream = createStreamableValue('');
  const textUIStream = createStreamableUI(
    <Message textStream={textStream.value} />,
  );
  const gui = createStreamableUI();

  const runQueue = [];

  (async () => {
    if (THREAD_ID) {
      await openai.beta.threads.messages.create(THREAD_ID, {
        role: 'user',
        content: question,
      });

      const run = await openai.beta.threads.runs.create(THREAD_ID, {
        assistant_id: ASSISTANT_ID,
        stream: true,
      });

      runQueue.push({ id: generateId(), run });
    } else {
      const run = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        stream: true,
        thread: {
          messages: [{ role: 'user', content: question }],
        },
      });

      runQueue.push({ id: generateId(), run });
    }

    while (runQueue.length > 0) {
      const latestRun = runQueue.shift();

      if (latestRun) {
        for await (const delta of latestRun.run) {
          const { data, event } = delta;

          status.update(event);

          gui.update(
            <div className="flex mt-2 mb-2">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-zinc-300 animate-pulse"></div>
              <div className="h-3 w-3 rounded-full bg-zinc-300 animate-pulse delay-150"></div>
              <div className="h-3 w-3 rounded-full bg-zinc-300 animate-pulse delay-300"></div>
            </div>
          </div>
          )

          if (event === 'thread.created') {
            THREAD_ID = data.id;
          } else if (event === 'thread.run.created') {
            RUN_ID = data.id;
        
          } else if (event === 'thread.message.delta') {
            data.delta.content?.map((part: any) => {
              if (part.type === 'text') {
                if (part.text) {
                  textStream.append(part.text.value);
                }
              }
            });
          } else if (event === 'thread.run.requires_action') {
            console.log(data)
            if (data.required_action) {
              if (data.required_action.type === 'submit_tool_outputs') {
                const { tool_calls } = data.required_action.submit_tool_outputs;
                const tool_outputs: Array<{ tool_call_id: string, output: string }> = [];

                for (const tool_call of tool_calls) {
                  const { id: toolCallId, function: fn } = tool_call;
                  const { name, arguments: args } = fn;

                  if (name === 'get_weather') {
      
                    gui.update(
                      <div>
                        <div className="flex flex-col p-4 bg-sky-400 rounded-lg gap-2">
                          <div className="flex flex-row justify-between">
                            <div>
                              <div className="text capitalize text-sky-100 mb-1 text-sm">
                                <div className="h-4 w-32 bg-sky-300/50 animate-pulse rounded"></div>
                              </div>
                              <div className="flex flex-row items-center gap-2">
                                <div className="text-4xl text-sky-50">
                                  <div className="h-8 w-12 bg-sky-300/50 animate-pulse rounded"></div>
                                </div>
                                <div className="size-8 rounded-full bg-sky-300/50 animate-pulse"></div>
                              </div>
                            </div>
                            <div>
                              <div className="capitalize text-sky-50 text-sm">
                                <div className="h-4 w-16 bg-sky-300/50 animate-pulse rounded"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-between">
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div className="text-xs mb-2 text-sky-200">
                                  <div className="h-3 w-8 bg-sky-300/50 animate-pulse rounded"></div>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-sky-300/50 animate-pulse"></div>
                                <div className="text-xs text-sky-50 mt-1">
                                  <div className="h-3 w-6 bg-sky-300/50 animate-pulse rounded"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                 

                    // Get weather data (coordinates for Paris)
                    const weatherData = await getWeather(48.864716, 2.349014);
                    
                    // Interpret weather conditions based on temperature
                    const getWeatherCondition = (temp: number): string => {
                      if (temp > 30) return 'Hot';
                      if (temp > 20) return 'Warm';
                      if (temp > 10) return 'Mild';
                      if (temp > 0) return 'Cold';
                      return 'Freezing';
                    };
                    
                    // Weather icon based on temperature and time
                    const getWeatherIcon = (temp: number, time: string): string => {
                      const hour = new Date(time).getHours();
                      const isNight = hour < 6 || hour > 20;
                      
                      if (isNight) return '🌙'; // Night icon
                      
                      if (temp > 20) return '☀️'; // Hot/sunny
                      if (temp > 10) return '🌤️'; // Mild/partly cloudy
                      if (temp > 0) return '☁️';  // Cold/cloudy
                      return '❄️';  // Freezing/snow
                    };
                    
                    // Format relative time
                    const formatTime = (timeString: string): string => {
                      const date = new Date(timeString);
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    };
                    
                    // Create forecast items
                    const createForecastItems = () => {
                      const items = [];
                      const hours = weatherData.hourly.time.slice(0, 24); // Next 24 hours
                      const temps = weatherData.hourly.temperature_2m.slice(0, 24);
                      
                      // Take 6 items (every 4 hours)
                      for (let i = 0; i < 18; i += 3) {
                        items.push(
                          <div key={i} className="flex flex-col items-center">
                            <div className="text-xs text-white/80">{formatTime(hours[i])}</div>
                            <div className="text-xl my-1">{getWeatherIcon(temps[i], hours[i])}</div>
                            <div className="font-medium text-white">{Math.round(temps[i])}°</div>
                          </div>
                        );
                      }
                      
                      return items;
                    };
                    
                    // Extract current data
                    const currentTemp = weatherData.current.temperature_2m;
                    const currentTime = weatherData.current.time;
                    const currentWind = weatherData.current.wind_speed_10m;
                    
                    // Get latest humidity (from hourly data)
                    const currentHumidityIndex = weatherData.hourly.time.findIndex(
                      (time: string) => time.split('T')[0] === currentTime.split('T')[0] && 
                             Number(time.split('T')[1].split(':')[0]) >= Number(currentTime.split('T')[1].split(':')[0])
                    );
                    const currentHumidity = weatherData.hourly.relative_humidity_2m[
                      currentHumidityIndex !== -1 ? currentHumidityIndex : 0
                    ];
        
                    // Replace loading state with weather card
                    
                    gui.done(
                      <div>
                        <div className="flex flex-col p-4 bg-sky-400 rounded-lg gap-2">
                          <div className="flex flex-row justify-between">
                            <div>
                              <div className="text capitalize text-sky-100 mb-1 text-sm">
                                {new Date(currentTime).toLocaleString([], {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex flex-row items-center gap-2">
                                <div className="text-4xl text-sky-50">{Math.round(currentTemp)}°</div>
                                <div className="size-8 rounded-full bg-yellow-200"></div>
                              </div>
                            </div>
                            <div>
                              <div className="capitalize text-sky-50 text-sm">{getWeatherCondition(currentTemp).toLowerCase()}</div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-between">
                            {weatherData.hourly.time.slice(0, 7).map((time: string, index: number) => (
                              <div key={index} className="flex flex-col items-center">
                                <div className="text-xs mb-2 text-sky-200">{formatTime(time)}</div>
                                <div className={index > 2 ? "relative" : ""}>
                                  <div className="w-6 h-6 rounded-full bg-yellow-200"></div>
                                  {index > 2 && (
                                    <div className="w-4 h-3 rounded-full bg-zinc-300 absolute bottom-0 -right-1"></div>
                                  )}
                                </div>
                                <div className="text-xs text-sky-50 mt-1">
                                  {Math.round(weatherData.hourly.temperature_2m[index])}°
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );

                    tool_outputs.push({
                      tool_call_id: toolCallId,
                      output: JSON.stringify(weatherData)
                    });
                    
                    return gui.value
                  } else if (name === 'read_gmails') {
                    // Show loading state for emails
                    gui.update(
                      <div className="flex flex-col p-4 bg-blue-100 rounded-lg gap-2">
                        <div className="text-lg font-medium text-blue-800 mb-2">Loading your emails...</div>
                        <div className="flex flex-col gap-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col bg-white p-3 rounded-md shadow-sm animate-pulse">
                              <div className="h-4 w-3/4 bg-blue-200 rounded mb-2"></div>
                              <div className="h-3 w-1/2 bg-blue-100 rounded mb-1"></div>
                              <div className="h-3 w-5/6 bg-blue-100 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    try {
                      // Get email data (last 100 emails)
                      const emailData = await readGmailMessages(100);
                      
                      // Group emails by sender domain
                      const emailsByDomain = emailData.reduce((acc: any, email: any) => {
                        const fromMatch = email.from.match(/@([^>]+)/);
                        const domain = fromMatch ? fromMatch[1] : 'unknown';
                        
                        if (!acc[domain]) {
                          acc[domain] = [];
                        }
                        acc[domain].push(email);
                        return acc;
                      }, {});
                      
                      // Calculate stats
                      const totalEmails = emailData.length;
                      const unreadCount = emailData.filter((email: any) => 
                        email.labelIds.includes('UNREAD')
                      ).length;
                      
                      // Sort domains by count
                      const sortedDomains = Object.keys(emailsByDomain).sort(
                        (a, b) => emailsByDomain[b].length - emailsByDomain[a].length
                      );
                      
                      // Get top 5 senders
                      const topSenders = sortedDomains.slice(0, 5).map(domain => ({
                        domain,
                        count: emailsByDomain[domain].length,
                        percentage: Math.round((emailsByDomain[domain].length / totalEmails) * 100)
                      }));
                      
                      // Replace loading state with email summary
                      gui.done(
                        <div className="flex flex-col p-4 bg-blue-50 rounded-lg gap-3">
                          <div className="text-lg font-medium text-blue-800 mb-1">Email Summary</div>
                          
                          <div className="flex justify-between mb-2">
                            <div className="text-sm text-blue-700">Total emails: <span className="font-medium">{totalEmails}</span></div>
                            <div className="text-sm text-blue-700">Unread: <span className="font-medium">{unreadCount}</span></div>
                          </div>
                          
                          <div className="text-sm font-medium text-blue-800 mb-1">Top Senders:</div>
                          <div className="flex flex-col gap-2">
                            {topSenders.map((sender, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-1/3 text-sm text-blue-700 truncate">{sender.domain}</div>
                                <div className="w-2/3 flex items-center gap-2">
                                  <div className="flex-1 bg-blue-100 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${sender.percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-blue-700">{sender.count}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-sm font-medium text-blue-800 mt-2 mb-1">Recent Emails:</div>
                          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                            {emailData.slice(0, 5).map((email: any, index: number) => (
                              <div key={index} className="flex flex-col bg-white p-3 rounded-md shadow-sm">
                                <div className="font-medium text-sm text-blue-900 truncate">{email.subject}</div>
                                <div className="text-xs text-blue-700 mb-1">{email.from}</div>
                                <div className="text-xs text-blue-600 opacity-75 truncate">{email.snippet}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                      
                      tool_outputs.push({
                        tool_call_id: toolCallId,
                        output: JSON.stringify(emailData)
                      });
                    } catch (error) {
                      console.error('Error reading Gmail:', error);
                      gui.done(
                        <div className="p-4 bg-red-100 rounded-lg">
                          <div className="text-red-700">Failed to access Gmail. Please check your authentication.</div>
                        </div>
                      );
                      
                      tool_outputs.push({
                        tool_call_id: toolCallId,
                        output: JSON.stringify({ error: 'Failed to access Gmail' })
                      });
                    }
                    
                    return gui.value;
                  }
                }

                const nextRun: any =
                  await openai.beta.threads.runs.submitToolOutputs(
                    THREAD_ID,
                    RUN_ID,
                    {
                      tool_outputs,
                      stream: true,
                    },
                  );

                runQueue.push({ id: generateId(), run: nextRun });
              }
            }
          } else if (event === 'thread.run.failed') {
            console.log(data);
          }
        }
      }
    }

    status.done();
    textUIStream.done();
    gui.done();
  })();

  return {
    id: generateId(),
    status: status.value,
    text: textUIStream.value,
    gui: gui.value,
  };
}
