<?php

namespace Tests\Feature;

use Nuwave\Lighthouse\Testing\ClearsSchemaCache;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\Subject;

class GraphTest extends TestCase
{
    /**
     * Create subject model and test graphql.
     *
     * @return void
     */

    public function test_create_subject(): void
    {
        // Postman works totally fine, don't know why the test can't pass sorry
        $subject = new \stdClass();
        $subject->name = "Deepak Bird";
        $subject->date_of_birth = "2018-05-23 13:43:32";
        $subject->score = 27;
        $subject->alive = false;
        $subject->test_chamber = 21;
        $subject->created_at = "2020-05-23 13:43:32";

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            mutation {
                createSubject(
                    name: ' . $subject->name . ',
                    date_of_birth: ' . $subject->date_of_birth . ',
                    score: $subject->score,
                    alive: $subject->alive,
                    test_chamber: $subject->test_chamber,
                    created_at: ' . $subject->created_at . ',
                ) {
                    name
                }
            }
        '

        )->assertJson([
            'data' => [
                'createSubject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);
    }

    /**
     * Update subject model and test graphql.
     *
     * @return void
     */

    public function test_update_subject(): void
    {
        $subject = Subject::factory()->create();
        //$this->testUserId = $subject->id;
        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                subject(id: ' . $subject->id . ') {
                    name
                }
            }
        '
        )->assertJson([
            'data' => [
                'subject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);

        // Postman works totally fine, don't know why the test can't pass sorry
        $subject->name .= "test";
        $subject->date_of_birth = "1800-05-23 13:43:32";
        $subject->score = 1;
        $subject->alive = false;
        $subject->test_chamber = 1;
        $subject->updated_at = "1800-05-23 13:43:32";

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            mutation {
                updateSubject(
                    id: ' . $subject->id . ',
                    name: ' . $subject->name . ',
                    date_of_birth: ' . $subject->date_of_birth . ',
                    score: $subject->score,
                    alive: $subject->alive,
                    test_chamber: $subject->test_chamber,
                    updated_at: ' . $subject->created_at . ',
                ) {
                    name
                }
            }
        '

        )->assertJson([
            'data' => [
                'updateSubject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);
    }

    /**
     * Destroy subject model and test graphql.
     *
     * @return void
     */

    public function test_destroy_subject(): void
    {
        $subject = Subject::factory()->create();
        //$this->testUserId = $subject->id;
        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                subject(id: ' . $subject->id . ') {
                    name
                }
            }
        '
        )->assertJson([
            'data' => [
                'subject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            mutation {
                deleteSubject(id: ' . $subject->id . ') {
                    name
                },
            }
        '
        )->assertJson([
            'data' => [
                'deleteSubject' => [
                    'name' => $subject->name,
                ],
            ],
        ]);
    }

    /**
     * Try to query Users, be rejected.
     *
     * @return void
     */

    public function testQueryUsersProtected(): void
    {
        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                users {
                    data {
                        name
                    }
                }
            }
        '
        )->decodeResponseJson();

        // The errors Expected type 'string'. Found 'Illuminate\Contracts\Support\Jsonable|JsonSerializable|array'.
        // It means that json_decode expects a JSON string, but found JsonSerializable|array'
        // Both tests below passed though, tried using implode() to convert it to string
        // Also tried json_encode() before decoding, neither of them works
        // The errors could be caused by plug-in of vscode, using phpstorm or turning off vscode plug-in solves the issue :P
        $message = array_shift(json_decode($response->json)->errors)->message;
        $this->assertEquals($message, "Unauthenticated.");
    }

    /**
     * Try to query Users as authenticated user, be successful.
     *
     * @return void
     */

    public function testQueryUsersAuthenticated(): void
    {
        $user = User::factory()->make();

        Sanctum::actingAs(
            $user,
        );

        $response = $this->graphQL(
            /** @lang GraphQL */
            '
            {
                users {
                    data {
                        name
                    }
                }
            }
        '
        )->decodeResponseJson();

        $users = json_decode($response->json)->data->users->data;
        $this->assertCount(1, $users);
    }
}
